from typing import Dict, Any, List, Optional
import re
import asyncio
from pipecat.processors.frameworks.rtvi import RTVIProcessor, RTVIConfig, RTVIObserver



class FormTools:
    """Form management tools for Gemini function calling"""
    
    def __init__(self):
        self.current_form = None
        self.form_data = {}
        self.form_fields = {}
        self.rtvi_observer = RTVIObserver(RTVIProcessor(config=RTVIConfig(config=[])))
    
    def get_form_tools(self) -> List[Dict[str, Any]]:
        """Return the form tools schema for Gemini"""
        return [
            {
                "name": "open_form",
                "description": "Open a new form for the user to fill out",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "form_type": {
                            "type": "string",
                            "enum": ["registration", "contact", "feedback"],
                            "description": "Type of form to open"
                        }
                    },
                    "required": ["form_type"]
                }
            },
            {
                "name": "update_form_field",
                "description": "Update a specific field in the current form",
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
                "name": "submit_form",
                "description": "Submit the current form if all required fields are filled",
                "parameters": {
                    "type": "object",
                    "properties": {}
                }
            }
        ]
    
    def open_form(self, form_type: str) -> Dict[str, Any]:
        """Open a new form of the specified type"""
        form_templates = {
            "registration": {
                "fields": ["name", "email", "phone"],
                "required": ["name", "email"],
                "title": "Registration Form"
            },
            "contact": {
                "fields": ["name", "email", "subject", "message"],
                "required": ["name", "email", "message"],
                "title": "Contact Form"
            },
            "feedback": {
                "fields": ["name", "rating", "comments"],
                "required": ["rating", "comments"],
                "title": "Feedback Form"
            }
        }
        
        if form_type not in form_templates:
            return {"success": False, "error": f"Unknown form type: {form_type}"}
        
        self.current_form = form_type
        self.form_fields = form_templates[form_type]
        self.form_data = {field: "" for field in self.form_fields["fields"]}
        
        return {
            "success": True,
            "form_type": form_type,
            "title": self.form_fields["title"],
            "fields": self.form_fields["fields"],
            "required": self.form_fields["required"],
            "message": f"I've opened a {form_type} form. Let's start filling it out."
        }
    
    def validate_field(self, field_name: str, value: str) -> Optional[str]:
        """Validate a field value. Return error message if invalid, else None."""
        if field_name == "email":
            # Simple email regex
            if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", value):
                return "That doesn't look like a valid email address. Please say your email again."
        elif field_name == "phone":
            # Accept digits, spaces, dashes, plus
            if not re.match(r"^[\d\s\-\+]{7,15}$", value):
                return "That doesn't look like a valid phone number. Please say your phone number again."
        elif field_name == "name":
            if not value.strip():
                return "Name cannot be empty. Please say your name."
        elif field_name == "rating":
            try:
                rating = int(value)
                if not (1 <= rating <= 5):
                    return "Rating must be between 1 and 5."
            except ValueError:
                return "Rating must be a number between 1 and 5."
        # Add more field-specific validation as needed
        return None

    def update_form_field(self, field_name: str, value: str) -> Dict[str, Any]:
        import datetime
        print(f"[{datetime.datetime.now()}] [DEBUG] update_form_field called with field_name='{field_name}', value='{value}'")
        if not self.current_form:
            print(f"[{datetime.datetime.now()}] [DEBUG] No form is currently open. Returning early.")
            return {"success": False, "error": "No form is currently open"}
        if field_name not in self.form_fields["fields"]:
            print(f"[{datetime.datetime.now()}] [DEBUG] Unknown field: {field_name}. Returning early.")
            return {"success": False, "error": f"Unknown field: {field_name}"}
        # Validate field
        validation_error = self.validate_field(field_name, value)
        if validation_error:
            print(f"[{datetime.datetime.now()}] [DEBUG] Validation error: {validation_error}. Returning early.")
            return {"success": False, "error": validation_error}
        print(f"[{datetime.datetime.now()}] [DEBUG] Field '{field_name}' passed validation. Updating value.")
        self.form_data[field_name] = value
        # Check if this was the last required field
        missing_required = [
            field for field in self.form_fields["required"] 
            if not self.form_data[field]
        ]
        if not missing_required:
            next_message = "Great! All required fields are filled. You can say 'submit form' when ready."
        else:
            next_message = f"Got it! {field_name} is {value}. What's your {missing_required[0]}?"

      
        print(f"[{datetime.datetime.now()}] [DEBUG] update_form_field completed successfully for field '{field_name}'.")
        return {
            "success": True,
            "field_updated": field_name,
            "value": value,
            "form_data": self.form_data,
            "missing_required": missing_required,
            "message": next_message
        }


    
    def submit_form(self) -> Dict[str, Any]:
        """Submit the current form, with validation of all required fields"""
        if not self.current_form:
            return {"success": False, "error": "No form is currently open"}
        # Check if all required fields are filled and valid
        missing_required = [
            field for field in self.form_fields["required"] 
            if not self.form_data[field]
        ]
        if missing_required:
            return {
                "success": False, 
                "error": f"Please fill in: {', '.join(missing_required)}"
            }
        # Validate all required fields
        for field in self.form_fields["required"]:
            validation_error = self.validate_field(field, self.form_data[field])
            if validation_error:
                return {"success": False, "error": validation_error}
        # Form is complete, submit it
        submitted_data = {
            "form_type": self.current_form,
            "data": self.form_data,
            "submitted_at": "2024-01-01T00:00:00Z"  # In real app, use actual timestamp
        }
        # Reset form
        self.current_form = None
        self.form_data = {}
        self.form_fields = {}
        return {
            "success": True,
            "submitted_data": submitted_data,
            "message": f"Perfect! Your {submitted_data['form_type']} form has been submitted successfully."
        }
    
    def get_form_status(self) -> Dict[str, Any]:
        """Get current form status"""
        if not self.current_form:
            return {"has_form": False}
        
        missing_required = [
            field for field in self.form_fields["required"] 
            if not self.form_data[field]
        ]
        
        return {
            "has_form": True,
            "form_type": self.current_form,
            "title": self.form_fields["title"],
            "form_data": self.form_data,
            "missing_required": missing_required,
            "is_complete": len(missing_required) == 0
        } 