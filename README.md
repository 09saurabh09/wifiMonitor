# wifiMonitor
Given TP-Link router it will monitor the data usage of devices via router </br>
Edit create a file config.json in config folder with following structure </br>

{</br>
	"auth" : {</br>
        "user": "Email_id",</br>
        "pass": "Password"</br>
    },</br>
    "db_query":"MONGO_DB_URL",</br>
    "host_address":"Host_email",    </br>
    "recipients": ["someone@mail.com","sometwo@mail.com"],</br>
    "mac_to_name_mail": {</br>
    	"B0-10-41-16-EA-EF" : ["Pankaj-PC", "bhanu.pankaj7711@gmail.com"],</br>
    	"70-F1-A1-C3-39-79" : ["Rakesh Kumar-PC", "rakeyshkumar13@gmail.com"],</br>
    	"00-24-2C-88-BE-27" : ["Saurabh-XPS", "pk32169@gmail.com"],</br>
    	"4C-25-78-36-7F-AC" : ["Nokia Lumia 920", "09saurabh09@gmail.com"],</br>
    	"90-21-81-72-A4-57" : ["Yu Yunique", "pk32169@gmail.com"],</br>
    	"AC-BC-32-77-92-21" : ["saurabhk-mac", "09saurabh09@gmail.com"]</br>
    }</br>
}</br>
</br>
