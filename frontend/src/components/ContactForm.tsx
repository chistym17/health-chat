import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, Stethoscope, Calendar, User, Mail } from 'lucide-react';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  email?: string;
  appointmentReason?: string;
  onFieldUpdate?: (field: string, value: string) => void;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  isOpen, 
  onClose, 
  patientName: externalPatientName, 
  email: externalEmail, 
  appointmentReason: externalAppointmentReason,
  onFieldUpdate 
}) => {
  const [patientName, setPatientName] = useState('');
  const [email, setEmail] = useState('');
  const [appointmentReason, setAppointmentReason] = useState('');

  // Update form fields when external values change
  useEffect(() => {
    if (externalPatientName) setPatientName(externalPatientName);
  }, [externalPatientName]);

  useEffect(() => {
    if (externalEmail) setEmail(externalEmail);
  }, [externalEmail]);

  useEffect(() => {
    if (externalAppointmentReason) setAppointmentReason(externalAppointmentReason);
  }, [externalAppointmentReason]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset form
    setPatientName('');
    setEmail('');
    setAppointmentReason('');
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
            <div className="flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-blue-500" />
              <CardTitle>Appointment Scheduling</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patientName" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Patient Name</span>
                </Label>
                <Input
                  id="patientName"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for confirmations"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointmentReason" className="flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4" />
                  <span>Appointment Reason</span>
                </Label>
                <Textarea
                  id="appointmentReason"
                  value={appointmentReason}
                  onChange={(e) => setAppointmentReason(e.target.value)}
                  placeholder="Describe your symptoms or reason for the appointment"
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Appointment
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

// Keep ContactForm for backward compatibility
export const ContactForm: React.FC<any> = (props) => {
  return <AppointmentForm {...props} />;
}; 