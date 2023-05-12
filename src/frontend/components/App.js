import { Link, BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react'
import { ethers } from "ethers"
import { Nav, NavbarBrand, NavItem, NavLink, Container, Button, Spinner } from "reactstrap";
import MusicNFTMarketplaceAbi from '../contractsData/MusicNFTMarketplace.json'
import MusicNFTMarketplaceAddress from '../contractsData/MusicNFTMarketplace-address.json'
import Home from './Home.js'
import MyTokens from './MyTokens.js'
import MyResales from './MyResales.js'
import './App.css';

function Navigation({ account, web3Handler }) {
  // const [isOpen, setIsOpen] = useState(false);
  // const toggle = () => setIsOpen(!isOpen);
  // console.log(isOpen);
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark" style={{ height: '70px' }}>
        <Container>
          <NavbarBrand className="logo text-uppercase" href="/"
            style={{ letterSpacing: '2px', fontWeight: 700, marginRight: '65px' }}>
            Chorus
          </NavbarBrand>
          {/* <NavbarToggler onClick={toggle}>
          <span className="navbar-toggler-icon"></span>
          </NavbarToggler>
          <Collapse isOpen={!isOpen}> */}
            <Nav className="navbar-center">
              <NavItem className="navbarItems">
                <Link to="/">Home</Link>
              </NavItem>
              <NavItem className="navbarItems">
                <Link to="/my-tokens">My Tokens</Link>
              </NavItem>
              <NavItem className="navbarItems">
                <Link to="/my-resales">My Resales</Link>
              </NavItem>
              <NavItem className="navbarItems">
                <a href="https://chorus-about.vercel.app/">About Chorus</a>
              </NavItem>
            </Nav>
            {/* </Collapse> */}
            <div className="nav-button ms-auto">
            <Nav className="navbar-end">
              {account ? (
                <NavLink href={`https://etherscan.io/address/${account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button nav-button btn-sm mx-4">

                  <Button variant="outline-light">
                    {account.slice(0, 5) + '...' + account.slice(38, 42)}
                  </Button>

                </NavLink>)
                : (
                  <Button
                    onClick={web3Handler}
                    color="none"
                    type="button"
                    className="btn btn-primary navbar-btn btn-rounded waves-effect waves-light"
                    style={{ backgroundColor: '#fb3e3e', borderColor: '#fb3e3e' }}>
                    Connect Wallet
                  </Button>)}
            </Nav>
            </div>
            </Container>
      </nav>
    </>
  )
}

function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [contract, setContract] = useState({})

  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])
    // Get provider from Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // Get signer
    const signer = provider.getSigner()
    loadContract(signer)
  }
  const loadContract = async (signer) => {
    // Get deployed copy of music nft marketplace contract
    const contract = new ethers.Contract(MusicNFTMarketplaceAddress.address, MusicNFTMarketplaceAbi.abi, signer)
    setContract(contract)
    setLoading(false)
  }
  return (
    <BrowserRouter>
      <div className="App">
        <Navigation account={account} web3Handler={web3Handler} />
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <Spinner animation="border" style={{ display: 'flex' }} />
              <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                <Home contract={contract} />
              } />
              <Route path="/my-tokens" element={
                <MyTokens contract={contract} />
              } />
              <Route path="/my-resales" element={
                <MyResales contract={contract} account={account} />
              } />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;