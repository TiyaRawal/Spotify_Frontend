import React, { useEffect, useState } from 'react'
import api from '../../utils/AxiosConfig'
import Footer from './Footer'
import '../styles/Browse.css'
import '../styles/Dashboard.css'
import { useNavigate } from 'react-router-dom'
import { DashboardMusicPlayer, DashboardNav, DashboardSidebar } from './Dashboard'

function DashBrowse() {
  return (
     <>
     <div className='dashboard-page'>
      <DashboardNav />
      <div className='dash-main'>
        <div className='dash-main-left'>
      <DashboardSidebar />
      </div>
      <div className='dash-main-right'>
        <DashBrowseContent/>
      </div>
      </div>
        <DashboardMusicPlayer/>
    </div>
    </>
  )
}

function DashBrowseContent() {
  let navigate = useNavigate()
  let[browsecategory,setBrowseCategory]= useState([])

  async function FetchBrowseCategory(){
    try{
      let response= await api.get("/browseCategory")
      if(response.status===200){
        setBrowseCategory(response.data.browseCategory)
      }
    }catch(e){
        console.log(e.response)
      alert(e.response?.data?.message || "Failed to load browse category" )
    }
  }

  useEffect(()=>{
    FetchBrowseCategory()
  },[])

 return (
    <>
    <div className='browse'>
        <h1>Browse all</h1>
    </div>
    <div className='browse-section'>
        {
            browsecategory.map((item)=>(
        <div className='browse-cards' key={item._id} style={{backgroundColor:item.color}}  onClick={() => navigate(`/dashbrowse/${item._id}`)}>
        <h1>{item.title}</h1>
        <img src={item.image} alt={item.title} />
        </div>
            ))
        }
    </div>
    </>
  )
}

export default DashBrowse