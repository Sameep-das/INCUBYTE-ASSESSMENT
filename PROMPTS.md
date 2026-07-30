### PROMPT 1 - 
Implement these in order and as prescribed (follow the constraints, from your memory)
1. Refactor the Test Suites to add more scrutinized tests and provide more test coverage for the code.
2. Improve the query syntax used, without adding any functionality or removing one, if a query is already well-structured. Leave it.

### PROMPT 2 - 
1. Create a comprehensive test suite for the user and car routes. The test suite must cover at least 90% of the intended codespace. The test assertions must strictly align with the response types and errors.

### PROMPT 3 - 
1. Refactor the Test Suites to add more scrutinized tests and provide more test coverage for the code.
2. The intention of the tests should be to expose if there is any vulnerability as of now in the system.
3. Also provide template code for maintainance window, such that it has release options as well

### PROMPT 4 - 
Create a frontend using React, TypeScript and Tailwind for a car dealership platform.
About the platform -
The users can view  cars. These cars will be in form of UI cards. Each car has a model name, manufacturer/company name,  category, quantity, price, and year of manufacturing. Furthermore, the card also contains a purchase button and a bookmark button (which only appears on hover) When bookmarked, the bookmarked car details are saved in localStorage whichc can be accessed by the frontend t o render users bookmarked cars.
The system has a single admin, which can login and logout and the is presented with the admin dashboard which shows all the cars, in form of cards, these cards will only have car model, manufacturer along with other details and and update and delete buttton. The dashboard also shows a chart of how different cars are  performing int hte market.
Do not create states for the admin and user to toggle between them as they will be at seperate endpoints.
In the homepage (/) the user is presented with a home screen that has view cars button and a signup button, on clicking signup the user is presented a form on top of the homepage (homepage gets blurred). The form contains - name, emai, phone number (optional), city, pincode, dropdown for states. on submitting the form is posted to /api/auth/register. Use RHF and zod to validate the form in frontend.
The homepage has a background animation in which different components of car, are in motion (the car components are like sketches rather than photographs, outline sketches mostly). The motion must not hallucinate user but add beauty to the design.
On a successful, login or signup user is taken to the page where all the cars are shown. The page also has search bar and has a filter option (use zomato's UI for filters) and on the top right of the page is an account icon and bookmarks (heart symbol).
FOr  any car if the available quantity is not enogh then the purchase button is blocked on UI.
All the  data mostly will come from the backend, so d o not hardcoded if things can be decoupled.
Use a maintainable folder structure along with descriptive file names.


# PROMPT 5 -
Move to the frontend folder and refactor it to fetch data from the backend apis as exposed for each route.
DO not change any code in backend folder
Do not change the UI of the web app at all, only refactor it.