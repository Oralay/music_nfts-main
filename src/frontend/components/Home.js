import { useState, useEffect, useRef } from 'react'
import { ethers } from "ethers"
import { SoundOutlined, StepBackwardOutlined, StepForwardOutlined, PlayCircleFilled, PauseCircleFilled } from "@ant-design/icons";
import { Slider, Button } from "antd";
import './App.css'

const Home = ({ contract }) => {
  const audioRef = useRef(null);
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(null)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [marketItems, setMarketItems] = useState(null)
  const loadMarketplaceItems = async () => {
    // Get all unsold items/tokens
    const results = await contract.getAllUnsoldTokens()
    const marketItems = await Promise.all(results.map(async i => {
      // get uri url from contract
      const uri = await contract.tokenURI(i.tokenId)
      // use uri to fetch the nft metadata stored on ipfs 
      const response = await fetch(uri + ".json")
      const metadata = await response.json()
      // define item object
      let item = {
        price: i.price,
        itemId: i.tokenId,
        name: metadata.name,
        artist: metadata.artist,
        audio: metadata.audio,
        image: metadata.imageCover
      }
      return item
    }))
    setMarketItems(marketItems)
    setLoading(false)
  }
  const buyMarketItem = async (item) => {
    await (await contract.buyToken(item.itemId, { value: item.price })).wait()
    loadMarketplaceItems()
  }
  const skipSong = (forwards) => {
    if (forwards) {
      setCurrentItemIndex(() => {
        let index = currentItemIndex
        index++
        if (index > marketItems.length - 1) {
          index = 0;
        }
        return index
      })
    } else {
      setCurrentItemIndex(() => {
        let index = currentItemIndex
        index--
        if (index < 0) {
          index = marketItems.length - 1;
        }
        return index
      })
    }
  }

  // const formatTime = (time) => {
  //   if (time && !isNaN(time)) {
  //     const minutes = Math.floor(time / 60);
  //     const formatMinutes =
  //       minutes < 10 ? `0${minutes}` : `${minutes}`;
  //     const seconds = Math.floor(time % 60);
  //     const formatSeconds =
  //       seconds < 10 ? `0${seconds}` : `${seconds}`;
  //     return `${formatMinutes}:${formatSeconds}`;
  //   }
  //   return '00:00';
  // };

  // const [trackProgress, setTrackProgress] = useState(0);
  // const [timeProgress, setTimeProgress] = useState(0);
  // const [duration, setDuration] = useState(0);

  // const onLoadedMetadata = () => {
  //   const seconds = audioRef.current.duration;
  //   setDuration(seconds);
  // };

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play()
    } else if (isPlaying !== null) {
      audioRef.current.pause()
    }
  })

  useEffect(() => {
    !marketItems && loadMarketplaceItems();
  })

  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )
  return (
    <div>
      {marketItems.length > 0 ?
          <main>
            <div className='mainContent'>
              <audio src={marketItems[currentItemIndex].audio} ref={audioRef} 
                      // onLoadedMetadata={onLoadedMetadata} 
                      />
              <div className="albums">
                {marketItems.map((song, index) => (
                  <div className="albumSelection" key={index}>
                    <img
                      src={song.image}
                      alt={song.name}
                      style={{ width: "200px", cursor: 'pointer' }}
                      onClick={() => {setCurrentItemIndex(index); setIsPlaying(true)}}
                    ></img>
                    <p className='songTitle'>{song.name}</p>
                    <p className='songArtist'>{song.artist}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Audio player starts here */}
            <div className="footerStyle">
              <div className='musicPlayer'>
                <div className="buttons" style={{ width: "300px", justifyContent: "start" }}>
                  <img className="cover" alt="currentCover" src={marketItems[currentItemIndex].image} />
                  <div>
                    <p className="songTitle">{marketItems[currentItemIndex].name}</p>
                    <p className="songArtist" style={{marginBottom: '10px'}}>{marketItems[currentItemIndex].artist}</p>
                    <Button onClick={() => buyMarketItem(marketItems[currentItemIndex])}>
                      {`Buy for ${ethers.utils.formatEther(marketItems[currentItemIndex].price)} ETH`}
                    </Button>
                  </div>
                </div>
                <div className="sliderAndButtons">
                  <div className="buttons">
                    <StepBackwardOutlined className="forback" onClick={() => skipSong(false)} />
                    {isPlaying ?
                      <PauseCircleFilled className="pauseplay" onClick={() => setIsPlaying(!isPlaying)} /> :
                      <PlayCircleFilled className="pauseplay" onClick={() => setIsPlaying(!isPlaying)} />}
                    <StepForwardOutlined className="forback" onClick={() => skipSong(true)} />
                  </div>
                  {/* <div className="buttons">
                    {formatTime(timeProgress)}
                    <Slider
                      className="progress"
                      value={trackProgress}
                      step={1}
                      min={0}
                      // max={duration ? duration : 0}
                      onChange={(value) => {
                        clearInterval(audioRef.current);
                        audioRef.current.currentTime = value;
                        setTrackProgress(audioRef.current.currentTime);
                      }}
                      onAfterChange={() => {
                        if (!isPlaying) {
                          setIsPlaying(true);
                        }
                      }}

                    />
                    {formatTime(duration)}
                  </div> */}
                </div>

                <div className="soundDiv">
                  <SoundOutlined />
                  <Slider className="volume"
                    defaultValue={100}
                    onChange={(value) => { audioRef.current.volume = value / 100 }} />
                </div>
              </div>
            </div>
          </main >
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No listed assets</h2>
          </main>
        )}

    </div >
  );
}
export default Home
