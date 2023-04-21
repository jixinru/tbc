import React, { useEffect, useState } from 'react';
import classNames from "classnames";
//css引入
import './style/index.scss';
import ReactKline from '../kline';
// 图片引入
import Dai from '../../assets/images/icons/dai.svg';
// import Gdai from '../../assets/images/icons/gdai.png' 

import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, polygon } from 'wagmi/chains'
import { Web3Button, Web3NetworkSwitch } from '@web3modal/react'
// 滑动条测试
// import { Slider } from 'antd';
import { Col, InputNumber, Row, Slider, Space } from 'antd';
import type { SliderMarks } from 'antd/es/slider';
// 按钮数据
import { getDataList } from "../../http/index";
// import { createWebSocket, closeWebSocket} from '../kline/js/websock';

const chains = [arbitrum, mainnet, polygon]
const projectId = 'dba7331053371470365be9206718fb4d'
const { provider } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  provider
})
const ethereumClient = new EthereumClient(wagmiClient, chains)
interface Cbk {
  fn?: Function
}
export let cpk: Cbk = {};

function Trading() {
  const [columnInput, setColumnInput] = useState(50);
  const setColumnInputChange = (e: any) => {
    var value = e.target.value.replace(/[^\d]/g, '')
    setColumnInput(value)
  }
  const [inputValue, setInputValue] = useState(2);

  const onChange = (newValue: any) => {
    setInputValue(newValue);
  };
  const marks: SliderMarks = {
    2: '2',
    25: '25',
    50: '50',
    75: '75',
    100: '100',
    125: '125',
    150: '150',
  };
  const [windowSize, setWindowSize] = useState(getWindowSize());
  let klinesData = {}
  let params = {
    symbol: 'AUDJPY',
    type: 15,
    limit: 600,
    stop_time: 1680511864020
  }

  useEffect(() => {
    function handleWindowResize() {
      setWindowSize(getWindowSize());
    }
    // setKlinesData(() => {
    //   return getKlinesData()
    // })
    getKlinesData()

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);


  function onRequestData(param: any, callback: any) {
    console.log(param, 'param');

    // 判断请求参数（品种和type的变化，如果变化需要重新获取历史记录）
    if (params.symbol !== param.symbol || params.type != param.type) {
      params = { ...param }
      cpk.fn = callback
      getKlinesData()
    }

    // setParams(param)
    callback(klinesData)
  }

  function getWindowSize() {
    const { innerWidth, innerHeight } = window;
    return { innerWidth: innerWidth - 300, innerHeight: innerHeight - 260 };
  }
  async function getKlinesData() {
    let obj: any = {}
    let res = await getDataList(params);
    if (res) {
      console.log(res);
      let arr: any = []
      res.data.data.records.map((item: any) => {
        let line: any = []
        for (const key in item) {
          if (key === 'time') {
            item[key] = item[key] * 1000
          } else {
            item[key] = Number(item[key])
          }
          line.push(item[key])
        }
        arr.push(line)
      })
      res.data.data.lines = arr.reverse()
      obj = res.data
      klinesData = obj

    }
  }
  return (
    <>
      <WagmiConfig client={wagmiClient}>
        {/* <ReactKline
        width={windowSize.innerWidth}
        height={windowSize.innerHeight}
        ranges={["1w", "1d", "1h", "30m", "15m", "5m", "1m", "line"]}
        symbol={"AUDJPY"}
        symbolName={"AUDJPY/USD"}
        intervalTime={10000}
        depthWidth={100}
        debug={false}
        onRequestData={onRequestData}
      /> */}
        {/* <iframe src="https://www.tradingview.com/chart/uDMO4E63/?symbol=CME_MINI%3AES1%21" ></iframe>
        <iframe src="https://gains.trade/trading#BTC-USD" ></iframe> */}
        <div className={classNames('Tasding')}>
          {/* 左边 */}
          <div className={classNames('Tasding_king')}>
            {/* 上边  */}
            <div className={classNames('Tasding_king_img')}>
              <ReactKline
                width={windowSize.innerWidth}
                height={windowSize.innerHeight}
                ranges={["1w", "1d", "1h", "30m", "15m", "5m", "1m", "line"]}
                symbol={"AUDJPY"}
                symbolName={"AUDJPY/USD"}
                intervalTime={10000}
                depthWidth={100}
                debug={false}
                onRequestData={onRequestData}
              />
              {/* <ReactKline
                width={600}
                height={400}
                ranges={["1w", "1d", "1h", "30m", "15m", "5m", "1m", "line"]}
                symbol={"BTC"}
                symbolName={"BTC/USD"}
                intervalTime={5000}
                depthWidth={100}
                debug={false}
                onRequestData={onRequestData}
              /> */}

            </div>
            {/* 下边 */}
            <div className={classNames('Tasding_king_bottom')}>
              下边
            </div>
          </div>
          {/* 右边 */}
          <div className={classNames('Tasding_data')}>
            <ul className={classNames('Tasding_data_title')}>
              <li className={classNames('active')}>Long</li>
              <li>Short</li>
            </ul>
            <div className={classNames('Tasding_data_content')}>
              <ul className={classNames('Tasding_data_content_row')}>
                <li className={classNames('active')}>Market</li>
                <li>Limit</li>
                <li>Stop</li>
              </ul>
              <div className={classNames('Tasding_data_content_row2')}>
                <div className={classNames('Tasding_data_content_row2_top')}>
                  <label>
                    Collateral
                    <span> (50 - 125k)</span>
                  </label>
                  <div>

                  </div>
                </div>
                <div className={classNames('Tasding_data_content_row2_btn')}>
                  {/* maxlength="6" autocomplete="off" */}
                  <input type="text" pattern="^([0-9]+(?:[.,][0-9]*)?)$" value={columnInput} onChange={(e) => setColumnInputChange(e)} />
                  <span>
                    <img src={Dai} alt="" />
                  </span>
                </div>
              </div>
              <div className={classNames('Tasding_data_content_row3')}>
                <div className='Tasding_data_content_row3_top'>
                  <p>
                    Leverage
                    <span>(2x- 150x)</span>
                  </p>
                  <InputNumber min={2} max={150} style={{ margin: '0 16px' }} value={inputValue} onChange={onChange} />
                </div>
                <div className='Tasding_data_content_row3_bottom'>
                  <Slider marks={marks} min={2} max={150} onChange={onChange} value={typeof inputValue === 'number' ? inputValue : 0} />
                </div>
              </div>
              <div className={classNames('Tasding_data_content_row4')}>
                <div className={classNames('Tasding_data_content_row4_left')}>
                  <p className={classNames('Tasding_data_content_row4_left_1')}>
                    Price
                  </p>
                  <p className={classNames('Tasding_data_content_row4_left_2')}>
                    28610.4
                  </p>
                </div>
                <div className={classNames('Tasding_data_content_row4_right')}>
                  <p>
                    Slippage
                    <span>
                      (%)
                    </span>
                  </p>
                  <InputNumber min={2} max={150} style={{ margin: '0 16px' }} value={inputValue} onChange={onChange} />
                </div>
              </div>
              <div className={classNames('Tasding_data_content_row5')}>
                <div className={classNames('Tasding_data_content_row5_top')}>
                  <p >
                    Stop loss
                    <span>
                      (None)
                    </span>
                  </p>
                  <p className={classNames('Tasding_data_content_row6_bun')}>

                  </p>
                </div>
              </div>
              <div className={classNames('Tasding_data_content_row6_bun')}>

              </div>
              <div className={classNames('Tasding_data_content_row7')}>
                <Web3Button />
              </div>
            </div>

          </div>
        </div>
        {/* <Web3NetworkSwitch /> */}
        {/* <Web3Button /> */}
      </WagmiConfig>

      {/* <Web3Modal projectId={projectId} ethereumClient={ethereumClient} /> */}
    </>
  );
}



export default Trading;