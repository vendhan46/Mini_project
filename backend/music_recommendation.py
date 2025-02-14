import os
import requests
import random

# Get API key from environment variable
API_KEY = os.getenv('YOUTUBE_API_KEY')

def get_recommendation(emotion):
    if not API_KEY:
        print("API Key is missing!")
        return []
    
    search_query = f"{emotion} tamil songs"
    search_url = "https://www.googleapis.com/youtube/v3/search"
    
    params = {
        'part': 'snippet',
        'q': search_query,
        'type': 'video',
        'maxResults': 10,
        'key': API_KEY
    }

    response = requests.get(search_url, params=params)
    print(f"API Response Code: {response.status_code}")
    
    if response.status_code == 200:
        search_results = response.json().get('items', [])
        video_urls = [f"https://www.youtube.com/watch?v={item['id']['videoId']}" for item in search_results]
        url=random.choice(video_urls)
        return url
    else:
        print(f"Error fetching data from YouTube API: {response.status_code}")
        print(response.text)  # Print the actual error message
        return []
