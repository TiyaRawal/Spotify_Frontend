import React, { useEffect, useState } from 'react'
import api from '../../utils/AxiosConfig'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
import '../styles/Browse.css'
import '../styles/home.css'
import { useNavigate } from 'react-router-dom'

function Browse() {
  return (
     <>
    <Header/>
    <div className='main'>
      <Sidebar/>
      <div className='main-right'>
      <BrowseContent/>      
      <Footer/>
      </div>
    </div>
    </>
  )
}

function BrowseContent() {
  let navigate=useNavigate()
  let[browsecategory,setBrowseCategory]=useState([])

  async function FetchBrowseCategory(){
    try{
      let response=await api.get("/browseCategory")
      console.log(response.data.browseCategory)
      if(response.status===200){
        setBrowseCategory(response.data.browseCategory)
      }
    }catch(e){
      console.log(e.response)
      alert(e.response?.data?.message || "Failed to load browse category")
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
        <div
          className='browse-cards'
          style={{backgroundColor:item.color}}
          key={item._id}
          onClick={()=>navigate(`/browse/${item._id}`)}
        >
          <h1>{item.title}</h1>
          <img src={item.image} alt={item.title} />
        </div>
            ))
        }
    </div>
    </>
  )
}

export default Browse