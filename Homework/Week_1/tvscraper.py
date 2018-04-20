#!/usr/bin/env python
# Name: Sebile Demirtas
# Student number: 10548270
"""
This script scrapes IMDB and outputs a CSV file with highest rated tv series.
"""
import re
import csv
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup


TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&title_type=tv_series"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'


def extract_tvseries(dom):
    """
    Extract a list of highest rated TV series from DOM (of IMDB page).
    Each TV series entry should contain the following fields:
    - TV Title
    - Rating
    - Genres (comma separated if more than one)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """

# separate lists for all the information fields available on IMDB-page
    title_list= []
    lists= dom("h3", "lister-item-header")
    for link in lists:
        title = link.contents[3]

        # check if title is available
        if not title:
            title = "No info available"

        title_list.append(title.string)

    ratings_list = []
    ratings = dom("span", "value")
    for rate in ratings:
        rated = rate.contents[0]

        # check if rating is available
        if not rated:
            rated = "No info available"

        ratings_list.append(rated.string)

    genres_list = []
    genres = dom("span", "genre")
    for genre in genres:
        theme = genre.contents[0]

        # check if themes are available
        if not theme:
            theme = "No info available"

        genres_list.append(theme.string)


    actors_list = []
    cast = ""
    counter = 0
	
    lists = dom("div", "lister-item-content")
    for movies in lists:
        movie = movies(href = re.compile("adv_li_st"))
        for actor in movie:
            
            counter += 1 
            actors = actor.string
            cast += str(actors)

            # add a comma after actor except for the last name
            if counter % len(movie) != 0:
               cast += str(", ")

            # check for missing cast
            if cast == "":
                cast = "No info available"

        actors_list.append(cast)
        cast = ""
    
    time_list = []
    times = dom("span", "runtime")
    for time in times:
        runtime = time.contents[0]

        # check for missing runtime
        if not runtime:
            runtime = "No info available"

        time_list.append(runtime.string.strip("min"))

    # lists information about single series in list then 
    # appends that list to list containing all series
    tvseries = []
    total = []
    for i in range (len(title_list)):
        total.extend((title_list[i], ratings_list[i], genres_list[i].strip(), actors_list[i], time_list[i]))

        tvseries.append(total)
        total = []

    return tvseries  


def save_csv(outfile, tvseries):
    """
    Output a CSV file containing highest rated TV-series.
    """
    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Genre', 'Actors', 'Runtime'])

    # write series and information to rows in CSV file
    for i in range (len(tvseries)):
        writer.writerow(tvseries[i])


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the tv series 
    tvseries = extract_tvseries(dom)

    # write the CSV file to disk 
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
         save_csv(output_file, tvseries)