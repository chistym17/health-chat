from typing import Dict, Any, List, Optional
import re
import asyncio
from datetime import datetime, timedelta
from pipecat.processors.frameworks.rtvi import RTVIProcessor, RTVIConfig, RTVIObserver


class AppointmentTools:
    """Appointment scheduling tools for healthcare voice bot"""
    
    def __init__(self):
        self.current_appointment = None
        self.appointment_data = {}
        self.appointment_fields = {}
        self.rtvi_observer = RTVIObserver(RTVIProcessor(config=RTVIConfig(config=[])))
    
    def get_appointment_tools(self) -> List[Dict[str, Any]]:
        """Return the appointment tools schema for Gemini"""
        return [
            {
                "name": "open_appointment",
                "description": "Open a new appointment scheduling form",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "appointment_type": {
                            "type": "string",
                            "enum": ["general", "urgent", "follow_up"],
                            "description": "Type of appointment to schedule"
                        }
                    },
                    "required": ["appointment_type"]
                }
            },
            {
                "name": "update_appointment_field",
                "description": "Update a specific field in the current appointment form",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "field_name": {
                            "type": "string",
                            "description": "Name of the field to update"
                        },
                        "value": {
                            "type": "string",
                            "description": "Value to set for the field"
                        }
                    },
                    "required": ["field_name", "value"]
                }
            },
            {
                "name": "submit_appointment",
                "description": "Submit the current appointment if all required fields are filled",
                "parameters": {
                    "type": "object",
                    "properties": {}
                }
            }
        ]
    
    def open_appointment(self, appointment_type: str = "general") -> Dict[str, Any]:
        """Open a new appointment scheduling form"""
        appointment_templates = {
            "general": {
                "fields": ["patient_name", "email", "appointment_reason", "preferred_date"],
                "required": ["patient_name", "email", "appointment_reason"],
                "title": "General Appointment"
            },
            "urgent": {
                "fields": ["patient_name", "email", "appointment_reason", "urgency_level"],
                "required": ["patient_name", "email", "appointment_reason", "urgency_level"],
                "title": "Urgent Care Appointment"
            },
            "follow_up": {
                "fields": ["patient_name", "email", "appointment_reason", "previous_visit_date"],
                "required": ["patient_name", "email", "appointment_reason"],
                "title": "Follow-up Appointment"
            }
        }
        
        if appointment_type not in appointment_templates:
            return {"success": False, "error": f"Unknown appointment type: {appointment_type}"}
        
        self.current_appointment = appointment_type
        self.appointment_fields = appointment_templates[appointment_type]
        self.appointment_data = {field: "" for field in self.appointment_fields["fields"]}
        
        return {
            "success": True,
            "appointment_type": appointment_type,
            "title": self.appointment_fields["title"],
            "fields": self.appointment_fields["fields"],
            "required": self.appointment_fields["required"],
            "message": f"I've opened an appointment scheduling form. Let's get your information to schedule your {appointment_type} appointment."
        }
    
    def validate_field(self, field_name: str, value: str) -> Optional[str]:
        """Validate a field value. Return error message if invalid, else None."""
        if field_name == "email":
            # Simple email regex
            if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", value):
                return "That doesn't look like a valid email address. Please say your email again."
        elif field_name == "patient_name":
            if not value.strip():
                return "Name cannot be empty. Please say your name."
            if len(value.strip()) < 2:
                return "Please provide your full name."
        elif field_name == "appointment_reason":
            if not value.strip():
                return "Please tell me why you need to see a doctor."
            if len(value.strip()) < 5:
                return "Please provide more details about your symptoms or reason for the appointment."
        elif field_name == "urgency_level":
            urgency_options = ["low", "medium", "high", "emergency"]
            if value.lower() not in urgency_options:
                return "Please specify urgency level: low, medium, high, or emergency."
        elif field_name == "preferred_date":
            # Basic date validation - could be enhanced
            if not value.strip():
                return "Please specify when you'd like to schedule the appointment."
        elif field_name == "previous_visit_date":
            if not value.strip():
                return "Please tell me when your last visit was."
        
        return None

    def update_appointment_field(self, field_name: str, value: str) -> Dict[str, Any]:
        import datetime
        print(f"[{datetime.datetime.now()}] [DEBUG] update_appointment_field called with field_name='{field_name}', value='{value}'")
        
        if not self.current_appointment:
            print(f"[{datetime.datetime.now()}] [DEBUG] No appointment form is currently open. Returning early.")
            return {"success": False, "error": "No appointment form is currently open"}
        
        if field_name not in self.appointment_fields["fields"]:
            print(f"[{datetime.datetime.now()}] [DEBUG] Unknown field: {field_name}. Returning early.")
            return {"success": False, "error": f"Unknown field: {field_name}"}
        
        # Validate field
        validation_error = self.validate_field(field_name, value)
        if validation_error:
            print(f"[{datetime.datetime.now()}] [DEBUG] Validation error: {validation_error}. Returning early.")
            return {"success": False, "error": validation_error}
        
        print(f"[{datetime.datetime.now()}] [DEBUG] Field '{field_name}' passed validation. Updating value.")
        self.appointment_data[field_name] = value
        
        # Check if this was the last required field
        missing_required = [
            field for field in self.appointment_fields["required"] 
            if not self.appointment_data[field]
        ]
        
        if not missing_required:
            next_message = "Great! All required information is collected. You can say 'submit appointment' when ready."
        else:
            # Provide helpful prompts for next field
            field_prompts = {
                "patient_name": "What's your full name?",
                "email": "What's your email address for appointment confirmations?",
                "appointment_reason": "What symptoms or reason brings you in today?",
                "urgency_level": "How urgent is this? Say low, medium, high, or emergency.",
                "preferred_date": "When would you prefer to come in?",
                "previous_visit_date": "When was your last visit?"
            }
            next_message = f"Got it! {field_name} is {value}. {field_prompts.get(missing_required[0], f'What\'s your {missing_required[0]}?')}"
        
        print(f"[{datetime.datetime.now()}] [DEBUG] update_appointment_field completed successfully for field '{field_name}'.")
        return {
            "success": True,
            "field_updated": field_name,
            "value": value,
            "appointment_data": self.appointment_data,
            "missing_required": missing_required,
            "message": next_message
        }

    def submit_appointment(self) -> Dict[str, Any]:
        """Submit the current appointment, with validation of all required fields"""
        if not self.current_appointment:
            return {"success": False, "error": "No appointment form is currently open"}
        
        # Check if all required fields are filled and valid
        missing_required = [
            field for field in self.appointment_fields["required"] 
            if not self.appointment_data[field]
        ]
        
        if missing_required:
            return {
                "success": False, 
                "error": f"Please provide: {', '.join(missing_required)}"
            }
        
        # Validate all required fields
        for field in self.appointment_fields["required"]:
            validation_error = self.validate_field(field, self.appointment_data[field])
            if validation_error:
                return {"success": False, "error": validation_error}
        
        # Generate appointment details
        appointment_id = f"APT-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        appointment_date = datetime.now() + timedelta(days=1)  # Default to tomorrow
        
        # Form is complete, submit it
        submitted_data = {
            "appointment_id": appointment_id,
            "appointment_type": self.current_appointment,
            "patient_name": self.appointment_data.get("patient_name", ""),
            "email": self.appointment_data.get("email", ""),
            "appointment_reason": self.appointment_data.get("appointment_reason", ""),
            "urgency_level": self.appointment_data.get("urgency_level", "medium"),
            "preferred_date": self.appointment_data.get("preferred_date", "tomorrow"),
            "previous_visit_date": self.appointment_data.get("previous_visit_date", ""),
            "scheduled_date": appointment_date.isoformat(),
            "status": "pending",
            "submitted_at": datetime.now().isoformat()
        }
        
        # Reset form
        self.current_appointment = None
        self.appointment_data = {}
        self.appointment_fields = {}
        
        return {
            "success": True,
            "submitted_data": submitted_data,
            "message": f"Perfect! Your appointment has been scheduled successfully. Your appointment ID is {appointment_id}. We'll send a confirmation email to {submitted_data['email']} with all the details."
        }
    
    def get_appointment_status(self) -> Dict[str, Any]:
        """Get current appointment form status"""
        if not self.current_appointment:
            return {"has_appointment": False}
        
        return {
            "has_appointment": True,
            "appointment_type": self.current_appointment,
            "appointment_data": self.appointment_data,
            "missing_required": [
                field for field in self.appointment_fields["required"] 
                if not self.appointment_data[field]
            ]
        }


# Keep the old FormTools class for backward compatibility but mark as deprecated
class FormTools:
    """Deprecated: Use AppointmentTools instead"""
    
    def __init__(self):
        print("Warning: FormTools is deprecated. Use AppointmentTools for healthcare appointments.")
        self.appointment_tools = AppointmentTools()
    
    def get_form_tools(self):
        return self.appointment_tools.get_appointment_tools()
    
    def open_form(self, form_type: str):
        return self.appointment_tools.open_appointment(form_type)
    
    def update_form_field(self, field_name: str, value: str):
        return self.appointment_tools.update_appointment_field(field_name, value)
    
    def submit_form(self):
        return self.appointment_tools.submit_appointment()
    
    def get_form_status(self):
        return self.appointment_tools.get_appointment_status() 