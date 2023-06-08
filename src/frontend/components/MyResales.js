import { useState, useEffect, useRef } from 'react'
import { ethers } from "ethers"
import { PlayCircleFilled, PauseCircleFilled } from "@ant-design/icons";
import { Row, Col, Card, Button } from 'react-bootstrap'
import './App.css';

export default function MyResales({ contract, account }) {
  const audioRefs = useRef([]);
  const [loading, setLoading] = useState(true)
  const [listedItems, setListedItems] = useState(null)
  const [soldItems, setSoldItems] = useState([])
  const [isPlaying, setIsPlaying] = useState(null)
  const [selected, setSelected] = useState(0)
  const [previous, setPrevious] = useState(null)
  const loadMyResales = async () => {
    // Fetch resale items from marketplace by quering MarketItemRelisted events with the seller set as the user
    let filter = contract.filters.MarketItemRelisted(null, account, null)
    let results = await contract.queryFilter(filter)
    // Fetch metadata of each nft and add that to item object.
    const listedItems = await Promise.all(results.map(async i => {
      // fetch arguments from each result
      i = i.args
      // get uri url from nft contract
      const uri = await contract.tokenURI(i.tokenId)
      // use uri to fetch the nft metadata stored on ipfs 
      const response = await fetch(uri + ".json")
      const metadata = await response.json()
      // define listed item object
      let purchasedItem = {
        price: i.price,
        itemId: i.tokenId,
        name: metadata.name,
        artist: metadata.artist,
        audio: metadata.audio,
        image: metadata.imageCover
      }
      return purchasedItem
    }))
    setListedItems(listedItems)
    // Fetch sold resale items by quering MarketItemBought events with the seller set as the user.
    filter = contract.filters.MarketItemBought(null, account, null, null)
    results = await contract.queryFilter(filter)
    // Filter out the sold items from the listedItems
    const soldItems = listedItems.filter(i => results.some(j => i.itemId.toString() === j.args.tokenId.toString()))
    setSoldItems(soldItems)
    setLoading(false)
  }
  useEffect(() => {
    if (isPlaying) {
      audioRefs.current[selected].play()
      if (selected !== previous) audioRefs.current[previous].pause()
    } else if (isPlaying !== null) {
      audioRefs.current[selected].pause()
    }

  })
  useEffect(() => {
    !listedItems && loadMyResales()
  })

  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )
  return (
    <div className="flex justify-center gradientBackground">
      <div className="flex justify-center">
        {listedItems.length > 0 ?
          <div className="px-5 py-3 container">
            <h2>Listed</h2>
            <Row xs={1} md={2} lg={4} className="g-4 py-3">
              {listedItems.map((item, idx) => (
                <Col key={idx} className="overflow-hidden">
                  <audio src={item.audio} ref={el => audioRefs.current[idx] = el}></audio>
                  <Card>
                    <Card.Img variant="top" src={item.image} />
                    <Card.Body color="secondary">
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Title>{item.artist}</Card.Title>
                      <div className="d-grid px-4">
                        <Button variant="secondary" onClick={() => {
                          setPrevious(selected)
                          setSelected(idx)
                          if (!isPlaying || idx === selected) setIsPlaying(!isPlaying)
                        }}>
                          {isPlaying && selected === idx ? (
                            <PauseCircleFilled style={{verticalAlign: 0}}/>
                          ) : (
                            <PlayCircleFilled style={{verticalAlign: 0}}/>
                          )}
                        </Button>
                      </div>
                      <Card.Text className="mt-1">
                        {ethers.utils.formatEther(item.price)} ETH
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            <>
              <h2>Sold</h2>
              {soldItems.length > 0 ?
                <Row xs={1} md={2} lg={4} className="py-3">
                  {soldItems.map((item, idx) => (
                    <Col key={idx} className="overflow-hidden">
                      <Card>
                        <Card.Img variant="top" src={item.image} />
                        <Card.Body color="secondary">
                          <Card.Title>{item.name}</Card.Title>
                          <Card.Title style={{fontWeight: 400}}>{item.artist}</Card.Title>
                          <Card.Text className="mt-1">
                            {ethers.utils.formatEther(item.price)} ETH
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
                : (
                  <main style={{ padding: "1rem 0" }}>
                    <h2 style={{'font-weight': '700'}}>No sold assets</h2>
                  </main>
                )}
            </>
          </div>
          : (
            <main style={{ padding: "1rem 0" }}>
              <h2 style={{'font-weight': '700'}}>No listed assets</h2>
            </main>
          )}
      </div>
    </div>
  );
}

