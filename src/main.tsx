import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from "react-router-dom"
import {Provider} from "react-redux"
import {Toaster} from "react-hot-toast"
import {store} from "./reducer/store.tsx"
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <Provider store={store} >
         <BrowserRouter>
    <App />
    <Toaster/>
  </BrowserRouter>
  </Provider>
 
)
