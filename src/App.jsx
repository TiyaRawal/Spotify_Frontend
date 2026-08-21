import {BrowserRouter,Routes,Route} from 'react-router-dom'  
import Signup from './pages/Signup'
import Header from './pages/Header'
import Login from './pages/Login'
import Footer from './pages/Footer'
import Home from './pages/Home'
import Browse from './pages/Browse'
import Dashboard from './pages/Dashboard'
import Description from './pages/Description'
import ArtistDescription from './pages/ArtistDescription'
import DashBrowse from './pages/DashBrowse'
import LikedSong from './pages/LikedSong'
import DashboardDescription from './pages/DasboardDescription'
import Profile from './pages/Profile'
import Premium from './pages/Premium'
import Playlist from './pages/Playlist'
import BrowseDescription from './pages/BrowseDescription'
import DashBrowseDescription from './pages/DashBrowseDescription'

function App() {

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/signup' element={<Signup/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/browse' element={<Browse/>}/>
      <Route path='/dashboard' element={<Dashboard/>}/>
      <Route path='/description/:id' element={<Description/>}/>
      <Route path='/artistdescription/:id' element={<ArtistDescription/>}/>
      <Route path='/dashbrowse' element={<DashBrowse/>}/>
      <Route path='/dashboarddescription/:id' element={<DashboardDescription/>}/>
      <Route path='/likedsongs' element={<LikedSong/>}/>
      <Route path='/profile' element={<Profile/>}/>
      <Route path='/premium' element={<Premium/>}/>
      <Route path='/playlist/:id' element={<Playlist/>}/>
      <Route path='/browse/:id' element={<BrowseDescription/>}/>
      <Route path='/dashbrowse/:id' element={<DashBrowseDescription/>}/>
    </Routes>
    </BrowserRouter>
  
    </>
  )
}

export default App
