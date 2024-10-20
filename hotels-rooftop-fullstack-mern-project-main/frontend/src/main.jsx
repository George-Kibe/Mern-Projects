import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './router/router'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import App from './App'


ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
     <RouterProvider router={router} />
     <App />
  </Provider>,
)
