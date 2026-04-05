import os
import requests
import random

# Get API key from environment variable
API_KEY = os.getenv('YOUTUBE_API_KEY')

# Fallback curated Tamil songs by emotion (used when YouTube API is unavailable)
FALLBACK_SONGS = {
    'happy': [
        'https://www.youtube.com/watch?v=kuceVNBTJio',  # Vaathi Coming
        'https://www.youtube.com/watch?v=BVpFBxWkiYY',  # Jolly O Gymkhana
        'https://www.youtube.com/watch?v=pVJk-mfYLi4',  # Aaluma Doluma
        'https://www.youtube.com/watch?v=wHRfnMjRbj8',  # Rowdy Baby
        'https://www.youtube.com/watch?v=iZ9iflvCwok',  # Kutti Story
    ],
    'sad': [
        'https://www.youtube.com/watch?v=_ykBuIJgVRs',  # Ennai Konjam
        'https://www.youtube.com/watch?v=s50vNwAfXbQ',  # Kanave Kanave
        'https://www.youtube.com/watch?v=fCeLwP_gV54',  # Nenjukkul Peidhidum
        'https://www.youtube.com/watch?v=7szaFOfW52I',  # Idhazhin Oram
        'https://www.youtube.com/watch?v=GSVHCRT7hWg',  # Unna Pethavan
    ],
    'angry': [
        'https://www.youtube.com/watch?v=pVJk-mfYLi4',  # Aaluma Doluma
        'https://www.youtube.com/watch?v=eV2MaSm-p-U',  # Vikram Title Track
        'https://www.youtube.com/watch?v=kuceVNBTJio',  # Vaathi Coming
        'https://www.youtube.com/watch?v=wHRfnMjRbj8',  # Rowdy Baby
        'https://www.youtube.com/watch?v=BVpFBxWkiYY',  # Jolly O Gymkhana
    ],
    'fear': [
        'https://www.youtube.com/watch?v=fCeLwP_gV54',  # Nenjukkul Peidhidum
        'https://www.youtube.com/watch?v=s50vNwAfXbQ',  # Kanave Kanave
        'https://www.youtube.com/watch?v=7szaFOfW52I',  # Idhazhin Oram
        'https://www.youtube.com/watch?v=_ykBuIJgVRs',  # Ennai Konjam
    ],
    'neutral': [
        'https://www.youtube.com/watch?v=fCeLwP_gV54',  # Nenjukkul Peidhidum
        'https://www.youtube.com/watch?v=s50vNwAfXbQ',  # Kanave Kanave
        'https://www.youtube.com/watch?v=kuceVNBTJio',  # Vaathi Coming
        'https://www.youtube.com/watch?v=7szaFOfW52I',  # Idhazhin Oram
    ],
    'surprise': [
        'https://www.youtube.com/watch?v=wHRfnMjRbj8',  # Rowdy Baby
        'https://www.youtube.com/watch?v=kuceVNBTJio',  # Vaathi Coming
        'https://www.youtube.com/watch?v=BVpFBxWkiYY',  # Jolly O Gymkhana
        'https://www.youtube.com/watch?v=pVJk-mfYLi4',  # Aaluma Doluma
    ],
    'disgust': [
        'https://www.youtube.com/watch?v=fCeLwP_gV54',  # Nenjukkul Peidhidum
        'https://www.youtube.com/watch?v=kuceVNBTJio',  # Vaathi Coming
        'https://www.youtube.com/watch?v=s50vNwAfXbQ',  # Kanave Kanave
        'https://www.youtube.com/watch?v=BVpFBxWkiYY',  # Jolly O Gymkhana
    ],
}

def get_fallback_song(emotion):
    """Return a random song from the fallback list for the given emotion."""
    songs = FALLBACK_SONGS.get(emotion, FALLBACK_SONGS.get('neutral', []))
    return random.choice(songs) if songs else None

def get_recommendation(emotion):
    if not API_KEY:
        print("API Key is missing! Using fallback songs.")
        return get_fallback_song(emotion)
    
    search_query = f"{emotion} tamil songs"
    search_url = "https://www.googleapis.com/youtube/v3/search"
    
    params = {
        'part': 'snippet',
        'q': search_query,
        'type': 'video',
        'maxResults': 10,
        'key': API_KEY
    }

    try:
        response = requests.get(search_url, params=params)
        print(f"API Response Code: {response.status_code}")
        
        if response.status_code == 200:
            search_results = response.json().get('items', [])
            if search_results:
                video_urls = [f"https://www.youtube.com/watch?v={item['id']['videoId']}" for item in search_results]
                return random.choice(video_urls)
            else:
                print("No results from YouTube API, using fallback.")
                return get_fallback_song(emotion)
        else:
            print(f"Error fetching data from YouTube API: {response.status_code}")
            print(response.text)
            print("Using fallback songs.")
            return get_fallback_song(emotion)
    except Exception as e:
        print(f"Exception while calling YouTube API: {e}")
        print("Using fallback songs.")
        return get_fallback_song(emotion)
