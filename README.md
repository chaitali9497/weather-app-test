# weather-app-test

<body>
  <form class="search-container">
    <input type="text" id="search-bar" placeholder="What can I help you with today?">
    <a href="#"><img class="search-icon" src="https://cdn0.iconfinder.com/data/icons/superglyph-communication/30/message-sending-1024.png"></a>
  </form>
</body>


body{
  padding-top: 75px;
}

.search-container{
  width: 490px;
  display: block;
  margin: 0 auto;
}

input#search-bar{
  margin: 0 auto;
  width: 100%;
  height: 45px;
  padding: 0 20px;
  font-size: 1rem;
  border: 1px solid #D0CFCE;
  outline: none;
  &:focus{
    border: 1px solid #008ABF;
    transition: 0.35s ease;
    color: #008ABF;
    &::-webkit-input-placeholder{
      transition: opacity 0.45s ease; 
  	  opacity: 0;
     }
    &::-moz-placeholder {
      transition: opacity 0.45s ease; 
  	  opacity: 0;
     }
    &:-ms-placeholder {
     transition: opacity 0.45s ease; 
  	 opacity: 0;
     }    
   }
 }

.search-icon{
  position: relative;
  float: right;
  width: 35px;
  height: 35px;
  top: -45px;
  right: -35px;
}



