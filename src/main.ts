import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { library } from './lib/stores/library.svelte'

void library.init()

export default mount(App, { target: document.getElementById('app')! })
