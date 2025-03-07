```
AIS Server

This repository contains the backend service for the AIS My Vessels Portfolio project. The server processes AIS (Automatic Identification System) signals from aisstream.io, manages vessel tracking data, and provides real-time updates to the frontend.

Project Overview

The AIS Server is responsible for handling vessel position data by:
	•	Receiving AIS signals from the aisstream.io service.
	•	Streaming live updates to the frontend via WebSockets.
	•	Storing vessel positions in a database (ais-db, hosted on Render) to ensure historical tracking.
	•	Retrieving the latest known vessel data from the database when a vessel is out of AIS coverage.

This ensures that the website always displays the most recent and relevant vessel data, whether from live AIS signals or stored records.
```

Live Deployment
• Website (https://oleksii-kozyrev-two.vercel.app/)
• Frontend (React, Next.js): (https://github.com/0leks11/AIS-My-Vessels-Portfolio) AIS My Vessels Portfolio (deployed on Vercel)
• Backend (Node.js, WebSockets, API): AIS Server (deployed on Render)
• Database (PostgreSQL, Render): ais-db

````
How It Works
	1.	The backend receives AIS signals from aisstream.io.
	2.	The server broadcasts real-time vessel updates to the frontend via WebSockets.
	3.	Each AIS signal is saved to the database, allowing historical tracking.
	4.	If a vessel goes out of range, the last known position is retrieved from the database and displayed.

Technologies Used
	•	Backend: Node.js, Express
	•	Data Handling: WebSockets, PostgreSQL
	•	Deployment: Render
	•	AIS Data Source: aisstream.io
    ```
````
