Start an empty tsconfig.json
```npx tsc --init```
Build and start server
```npx tsc -b && node dist/index.js```
Test websocket connection
```wscat -c ws://localhost:8000```