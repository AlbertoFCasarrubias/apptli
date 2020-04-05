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

# Agora
```
ng add ngx-agora
```
