#!/usr/bin/env python3
"""
Test script to verify RAG chatbot is working after fixes
"""
import requests
import json

def test_chatbot():
    url = "http://localhost:4000/api/chat"
    
    test_messages = [
        "Why are my emissions high today?",
        "How can I reduce emissions by 20%?",
        "Which supplier has the highest CO₂?"
    ]
    
    print("Testing RAG Chatbot after fixes...")
    print("=" * 60)
    
    for i, message in enumerate(test_messages, 1):
        print(f"\n{i}. Testing: {message}")
        print("-" * 60)
        
        try:
            response = requests.post(
                url,
                json={"message": message},
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Success!")
                print(f"Response: {data.get('response', 'No response')[:200]}...")
            else:
                print(f"❌ Error: Status {response.status_code}")
                print(f"Response: {response.text[:200]}")
                
        except requests.exceptions.Timeout:
            print("❌ Request timed out")
        except Exception as e:
            print(f"❌ Error: {str(e)}")
    
    print("\n" + "=" * 60)
    print("Test complete!")

if __name__ == "__main__":
    test_chatbot()
