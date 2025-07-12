import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X } from 'lucide-react';

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  name?: string;
  email?: string;
  message?: string;
  onFieldUpdate?: (field: string, value: string) => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ 
  isOpen, 
  onClose, 
  name: externalName, 
  email: externalEmail, 
  message: externalMessage,
  onFieldUpdate 
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Update form fields when external values change
  useEffect(() => {
    if (externalName) setName(externalName);
  }, [externalName]);

  useEffect(() => {
    if (externalEmail) setEmail(externalEmail);
  }, [externalEmail]);

  useEffect(() => {
    if (externalMessage) setMessage(externalMessage);
  }, [externalMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset form
    setName('');
    setEmail('');
    setMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Form Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg z-50 transform transition-transform duration-300">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Contact Form</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message"
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}; 