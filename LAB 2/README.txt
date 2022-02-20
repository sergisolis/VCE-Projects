APP WORKFLOW

    LOGIN
        - On enter, the user must enter three required fields (name, password, avatar) and click the login button in order to create the websocket connection.
        - If the same user is already connected on another session an error message should be displayed and connection aborted.
        - We decided to store any previous user of the world with the credential pair (name, password).
        - If the user is new server will create the new user and add it on a JSON file.
        - If the user exists, server should load the last state of the user from the JSON file.

    WORLD
        - Website layout is composed by the canvas and the chat.
        - We create 4 rooms, room 0 is connected with all the rooms and the other rooms are connected with room 0 using doors.
        - We decided to have the same background for all the rooms adding different elements to differentiate them in order to preserve the app style.
        - Users are displayed with the name on the top of their avatar and additionally distance is displayed on the top of the other users.
        - Users can move using only the left click of the mouse.

    CHAT
        - Chat only displays messages of users on the same room that are at maximum 300 distance.
        - User messages are displayed on blue and other users messages are displayed on yellow.
        - When users change room the chat will be erased.

    INTERACTIVITY
        - When a door room is used the door clicked and the door on the room where the user is moving will be opened.
        - Server will send a doorTick function every 10 secs to close the opened doors.
        - We display some lamps that can be clicked to open or close the light.

    SYNCRO
        - Server sends every 1 sec a tick with all the information of the users inside the same room.
        - When a user moves, the client should send a message to the server that updates the user position.
        - On change room user must be moved from the old room to the new room.
        - Interactive objects should be synchronized for all users.
    
    PROTOCOLS
        login
            Send login credentials to the server and once is processed it returns the info to the client to create the local user.
        room
            Send the state of the whole room to the user useful on login or on room change.
        users
            Send the state of all the users of the room.
        user_update
            Send to the server any change of the user to update it.
        change_room
            Remove the user from the old room and put it in a new room.
        change_object
            Change the state of the object for all the users of the room.
        text
            Sends a message to the other users of the room that are at maximum at 300 distance.
        connection_error
            Sends an error message and display an error on the login layout.

