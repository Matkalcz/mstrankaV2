#!/usr/bin/env python3
import json
import requests
import sseclient

API_KEY = "msk_822251dd65802f82b1e57cb2e2dcd8ba9ec453e22ec5d129bfc812280fd391aa"
URL = "https://mcp.v2.mstranka.cz/sse"

headers = {
    "X-Api-Key": API_KEY,
    "Accept": "text/event-stream"
}

try:
    print(f"Connecting to MCP server: {URL}")
    response = requests.get(URL, headers=headers, stream=True)
    
    if response.status_code == 200:
        print("Connection successful!")
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        # Try to read first few events
        client = sseclient.SSEClient(response)
        for i, event in enumerate(client.events()):
            if i >= 3:  # Read only first 3 events
                break
            print(f"\nEvent {i+1}:")
            print(f"  Type: {event.event}")
            print(f"  Data: {event.data[:200]}...")
    else:
        print(f"Connection failed: {response.status_code}")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()