import speech_recognition as sr
import pyttsx3
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow frontend access

# Initialize text-to-speech engine
engine = pyttsx3.init()

def speak(text):
    """Convert text to speech"""
    engine.say(text)
    engine.runAndWait()

def recognize_speech():
    """Capture voice input and convert it to text"""
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening...")
        recognizer.adjust_for_ambient_noise(source)  # Adjust for background noise
        audio = recognizer.listen(source)
        
        try:
            command = recognizer.recognize_google(audio)
            print(f"You said: {command}")
            return command
        except sr.UnknownValueError:
            return "Sorry, I couldn't understand that."
        except sr.RequestError:
            return "Sorry, there was an error processing your request."

@app.route('/start-voice', methods=['GET'])
def start_voice():
    """Start the voice assistant"""
    user_input = recognize_speech()  # Get speech input
    response = f"You said: {user_input}"
    
    if "hello" in user_input.lower():
        response = "Hello! How can I assist you today?"
    elif "your name" in user_input.lower():
        response = "I am your voice assistant."

    speak(response)  # Convert response to speech
    return jsonify({'message': response})

if __name__ == '__main__':
    app.run(port=5001, debug=True)
