import { useEffect, useRef, useCallback } from 'react';
import { ChatMessage } from '../types/rtvi';

export const useContactFormTrigger = (
  messages: ChatMessage[], 
  onOpenForm: () => void,
  onUpdateField?: (field: string, value: string) => void,
  onSubmitForm?: () => void
) => {
  const lastProcessedMessageId = useRef<string>('');
  const formOpened = useRef<boolean>(false);
  
  // Store callbacks in refs to avoid dependency issues
  const onOpenFormRef = useRef(onOpenForm);
  const onUpdateFieldRef = useRef(onUpdateField);
  const onSubmitFormRef = useRef(onSubmitForm);
  
  // Update refs when callbacks change
  onOpenFormRef.current = onOpenForm;
  onUpdateFieldRef.current = onUpdateField;
  onSubmitFormRef.current = onSubmitForm;

  useEffect(() => {
    const newMessages = messages.filter(msg => msg.id !== lastProcessedMessageId.current);
    
    for (const message of newMessages) {
      if (message.type === 'bot') {
        const text = message.text.toLowerCase().trim();
        
        // Check if bot is asking about form types
        if (text.includes('which form') || text.includes('what type of form') || text.includes('registration, contact, or feedback')) {
          formOpened.current = true;
          onOpenFormRef.current();
        }
      }
      
      // Parse user messages for form field updates and submission
      if (message.type === 'user' && !message.isInterim && formOpened.current) {
        const text = message.text.toLowerCase().trim();
        
        // Check for submission commands first
        const submitPatterns = [
          /submit/i,
          /send/i,
          /done/i,
          /finish/i,
          /complete/i,
          /that's it/i,
          /that is it/i,
          /i'm done/i,
          /i am done/i
        ];
        
        let isSubmission = false;
        for (const pattern of submitPatterns) {
          if (pattern.test(text)) {
            isSubmission = true;
            if (onSubmitFormRef.current) {
              onSubmitFormRef.current();
            }
            break;
          }
        }
        
        // If it's not a submission, process field updates
        if (!isSubmission && onUpdateFieldRef.current) {
          // Parse name patterns
          const namePatterns = [
            /my name is (.+)/i,
            /name is (.+)/i,
            /i'm (.+)/i,
            /i am (.+)/i,
            /call me (.+)/i
          ];
          
          for (const pattern of namePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
              const name = match[1].trim();
              if (name.length > 1 && name.length < 50) {
                onUpdateFieldRef.current('name', name);
                break;
              }
            }
          }
          
          // Parse email patterns
          const emailPatterns = [
            /my email is (.+)/i,
            /email is (.+)/i,
            /email address is (.+)/i,
            /my email address is (.+)/i
          ];
          
          for (const pattern of emailPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
              const email = match[1].trim();
              // Simple email validation
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (emailRegex.test(email)) {
                onUpdateFieldRef.current('email', email);
                break;
              }
            }
          }
          
          // Parse message patterns
          const messagePatterns = [
            /my message is (.+)/i,
            /message is (.+)/i,
            /i want to say (.+)/i,
            /tell them (.+)/i
          ];
          
          for (const pattern of messagePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
              const message = match[1].trim();
              if (message.length > 3) {
                onUpdateFieldRef.current('message', message);
                break;
              }
            }
          }
        }
      }
      
      lastProcessedMessageId.current = message.id;
    }
  }, [messages]); // Only depend on messages, not the callbacks
}; 