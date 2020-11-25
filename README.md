```
ng add @angular/pwa
npm install -g firebase-tools

frebase init
    Hosting: Configure and deploy Firebase Hosting sites
    What do you want to use as your public directory? www
    Configure as a single-page app (rewrite all urls to /index.html)? No
```

This create firebase.json, add this... 
```
{
  "hosting": {
    "public": "www",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/build/app/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000"
          }
        ]
      },
      {
        "source": "ngsw-worker.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      }
    ]
  }
}
```

package.json scripts that help
```
"server": "ionic build  && http-server ./www -p 8888",
"firebase": "ionic build --prod && firebase deploy",
"lighthouse": "lighthouse http://localhost:8888 --view",
"dist": "ionic build --prod -- --base-href /apptli/"
```

```
curl -X POST \
  https://fcm.googleapis.com/fcm/send \
  -H 'Authorization: key=AAAAZHticEY:APA91bG-Sc3nVvk9eMt-rmqU7pfo9sE2HcUIdJHy5pzc6jIROCm8H5nk_TtTeZan-oGpN9DWpnznQAAwGhGErGTnSYsdn--njH7d2mwwkg8ZOspZCuR_GcKj7xNMnoN4tonQsZXPQxND' \
  -H 'Content-Type: application/json' \
  -d '{
 "notification": {
  "title": "Hello World",
  "body": "This is Message from Admin"
 },
 "to" : "czrQ1qGWb7U2L6b4ckg6l3:APA91bHFKM4uimciQpnTYJA5-7UhT9nzCtK9tuyUokQ--dIn4SDa9kV4RERFqgs7fpqs67Cwa0XDlX_5ulcjUJeOG-t91HBOTaTyVSK0NoAx6hRxiGykM4NnY7yT-7k7XnP7phksq1J8"
}'

```

## Deploy functions
```
firebase deploy --only functions
```

