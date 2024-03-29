'use client'
import Cookies from 'js-cookie';
import dynamic from 'next/dynamic';
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });
import { useEffect, useState } from 'react';
import styles from './page.module.css'

import Stanza from '../assets/Stanza.svg'
import Altezza from '../assets/Altezza.svg'
import Lunghezza from '../assets/Lunghezza.svg'
import Profondita from '../assets/Profondita.svg'

import Image from 'next/image';

import Slider from '@mui/joy/Slider';


export default function RisonanzeStanza(){
  const [dataLoaded, setDataLoaded] = useState(false);

  const [ room, setRoom ] = useState({x: '', y: '', z: ''});
  const [ rt60, setRt60 ] = useState(0.33);

  const [ modiAssiali, setModiAssiali ] = useState([]);
  const [ modiTangenziali, setModiTangenziali ] = useState([]);
  const [ modiObliqui, setModiObliqui ] = useState([]);
  const [ data, setData ] = useState([]);

  const soundSpeed = 340;

  const handleClick = () => {
    const volumeRoom = Number(room.x) * Number(room.y) * Number(room.z);

    if (volumeRoom && rt60){
      const fineRegioneB = 1875 * Math.sqrt(rt60/volumeRoom);

      const modiAssialiToSet = [];
      const modiTangenzialiToSet = [];
      const modiObliquiToSet = [];

      for (let i = 0; i < 10; i++){
        for (let j = 0; j < 10; j++){
          for (let k = 0; k < 10; k++){
            const frequency = (soundSpeed/2) * Math.sqrt(Math.pow(i/room.x, 2) + Math.pow(j/room.y, 2) + Math.pow(k/room.z, 2));
            let ampiezza;

            if ((frequency < fineRegioneB)) {
              if ((i != 0 && j == 0 && k == 0) || (i == 0 && j != 0 && k == 0) || (i == 0 && j == 0 && k != 0)){
                modiAssialiToSet.push({i: i, j: j, k: k, frequency: frequency, db: 100/(i + j + k)});
              }
              if ((i != 0 && j != 0 && k == 0) || (i != 0 && j == 0 && k != 0) || (i == 0 && j != 0 && k != 0)){
                if ( i === j || j === k || i === k ){
                  ampiezza = 70 / ((i + j + k) / 2);
                } else {
                  const media = (i + j + k) / 2;
                  const numSucc = 70 / Math.max(i, j, k);

                  ampiezza = numSucc + (numSucc / media);
                }
                modiTangenzialiToSet.push({i: i, j: j, k: k, frequency: frequency, db: ampiezza});
              }
              if (i != 0 && j != 0 && k != 0) {
                if ( i == j == k ){
                  ampiezza = 50 / ((i + j + k) / 3);
                } else {
                  const media = (i + j + k) / 3;
                  const numSucc = 50 / Math.max(i, j, k);

                  ampiezza = numSucc + (numSucc / media);
                }
                modiObliquiToSet.push({i: i, j: j, k: k, frequency: frequency, db: ampiezza});
              }
            }
          }
        }
      }

      modiAssialiToSet.sort(function(a, b) {
        return a.frequency - b.frequency;
      });
      modiTangenzialiToSet.sort(function(a, b) {
        return a.frequency - b.frequency;
      });
      modiObliquiToSet.sort(function(a, b) {
        return a.frequency - b.frequency;
      });

      setModiAssiali(modiAssialiToSet);
      setModiTangenziali(modiTangenzialiToSet);
      setModiObliqui(modiObliquiToSet);

      const allModi = modiAssialiToSet.concat(modiTangenzialiToSet, modiObliquiToSet);

      const dataToSet = [];
      const campanatura = 2.2 / rt60;
      allModi.forEach((modo) => {
        dataToSet.push([modo.frequency - (campanatura / 2), modo.frequency + (campanatura / 2), modo.db])
      })

      Cookies.set('room', JSON.stringify(room));
      Cookies.set('rt60', rt60.toString());     
    
      setData(dataToSet);
    } else {
      setData([]);
    }
  }

  useEffect(() => {
    const savedRoom = Cookies.get('room');
    const savedRt60 = Cookies.get('rt60');

    if (savedRoom) setRoom(JSON.parse(savedRoom));
    if (savedRt60) setRt60(parseFloat(savedRt60));
    if (savedRoom || savedRt60) setDataLoaded(true);
  }, []);

  useEffect(() => {
    if (dataLoaded) {
      handleClick();
      setDataLoaded(false);
    }
  }, [dataLoaded, room, rt60]);

  const allModi =  modiAssiali.concat(modiTangenziali, modiObliqui);
  
  return (
    <div className={styles.mainContainer}>
      <div className={styles.topContainer}>
        <div className={styles.leftContainer}>
          <FormRoom room={room} setRoom={setRoom} rt60={rt60} setRt60={setRt60}/>
          <button onClick={handleClick} className={`button ${(!room.x || !room.y || !room.z || !rt60) ? "disabled" : "enabled"}`} disabled={!room.x || !room.y || !room.z || !rt60}>Calcolo</button>
        </div>
        <div className={styles.rightContainer}>
          {data.length > 0 ? <GraficoSomme data={data}/> : <span className={styles.error}>Inserisci tutti i dati per visualizzare il grafico</span>}
          {allModi.length > 0 && <GraficoSingole data={allModi}/>}
        </div>
      </div>
      {data.length > 0 &&
        <div className={styles.bottomContainer}>
          <div className={styles.modo}>
            <div className={styles.modoTitle}>Modi Assiali</div>
            {modiAssiali.map((modo, i) => {
              return <span key={i}>({modo.i} {modo.j} {modo.k}) {Math.round(modo.frequency * 100) / 100} Hz</span>
            })}
          </div>
          <div className={styles.modo}>
            <div className={styles.modoTitle}>Modi Tangenziali</div>
            {modiTangenziali.map((modo, i) => {
              return <span key={i}>({modo.i} {modo.j} {modo.k}) {Math.round(modo.frequency * 100) / 100} Hz</span>
            })}
          </div>
          <div className={styles.modo}>
            <div className={styles.modoTitle}>Modi Obliqui</div>
            {modiObliqui.map((modo, i) => {
              return <span key={i}>({modo.i} {modo.j} {modo.k}) {Math.round(modo.frequency * 100) / 100} Hz</span>
            })}
          </div>
        </div>
      }
    </div>
  )
}


function FormRoom(props){
  const [ selectedInput, setSelectedInput ] = useState(0);
  const [ openMiniPopup, setOpenMiniPopup ] = useState(false);

  const handleInput = (dimension) => {
    return (event) => {
      props.setRoom({ ...props.room, [dimension]: event.target.value });
    }
  }

  return(
    <div className={`${styles.roomContainer}`}>
      <Image src={selectedInput === 0 ? Stanza : selectedInput === 1 ? Lunghezza : selectedInput === 2 ? Profondita : selectedInput === 3 && Altezza} className='svgStanza' alt=''/>
      <div className='form'>
        <div className='field'>
          <label>Lunghezza</label>
          <div className='inputContainer'>
            <input onChange={handleInput('x')} onFocus={() => setSelectedInput(1)} onBlur={() => setSelectedInput(0)} value={props.room.x} type='number'/>
            <span>m</span>
          </div>
        </div>
        <div className='field'>
          <label>Profondità</label>
          <div className='inputContainer'>
            <input onChange={handleInput('y')} onFocus={() => setSelectedInput(2)}  onBlur={() => setSelectedInput(0)}value={props.room.y} type='number'/>
            <span>m</span>
          </div>
        </div>
        <div className='field'>
          <label>Altezza</label>
          <div className='inputContainer'>
            <input onChange={handleInput('z')} onFocus={() => setSelectedInput(3)} onBlur={() => setSelectedInput(0)} value={props.room.z} type='number'/>
            <span>m</span>
          </div>
        </div>
        <div className='field'>
          <label>RT60 Medio <i className={styles.closePopup} onClick={() => setOpenMiniPopup(!openMiniPopup)}>ⓘ</i>
            <div className={`${styles.miniPopup} ${openMiniPopup && styles.openPopup}`}>
              <div>Inserisci il tuo valore reale</div>
            </div>
          </label>
          <div className='inputContainer'>
            <input onChange={(event) => props.setRt60(event.target.value)}  value={props.rt60} type='number'/>
            <span>s</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function GraficoSomme(props) {
  const [chartData, setChartData] = useState([]);
  const [ resolution, setResolution ] = useState(1000);

  useEffect(() => {
    const data = props.data;

    const startTimes = data.map(([start]) => start);
    const endTimes = data.map(([_, end]) => end);

    const totalPoints = resolution;
    const xValues = Array.from({ length: totalPoints }, (_, i) =>
      Math.pow(10, (Math.log10(Math.min(...startTimes)) + i / totalPoints * (Math.log10(Math.max(...endTimes)) - Math.log10(Math.min(...startTimes)))))
    );

    const sumAmplitudes = new Array(totalPoints).fill(0);
    data.forEach(([start, end, amplitude]) => {
      const indices = xValues.map((x, i) => x >= start && x <= end ? i : null).filter(index => index !== null);
      indices.forEach(index => sumAmplitudes[index] += amplitude);
    });

    const sumAmplitudesLog = new Array(totalPoints).fill(0);
    sumAmplitudes.forEach((amplitude, x) => {
      sumAmplitudesLog[x] = 20 * Math.log10(amplitude);
    })

    setChartData([
      {
        x: xValues,
        y: sumAmplitudesLog,
        type: 'bar',
        marker: { color: '#457dff' },
      },
    ]);

  }, [props.data, resolution]);

  return (
    <>
      <Plot
        data={chartData}
        layout={{
          xaxis: {
            type: 'log',
            title: 'Frequenza (Hz)',
          },
          yaxis: {
            title: 'Ampiezza',
          },
          title: 'Grafico con campanatura e ampiezza sommata',
          width: 600,
          height: 400,
        }}
      />
      <div className={styles.resolution}>
        <span>Risoluzione</span>
        <Slider
          value={resolution}
          step={50}
          min={10}
          max={1000}
          onChange={(event, value) => setResolution(value)}
        />
      </div>

    </>
  );
}

function GraficoSingole(props) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const data = props.data;

    let xValues = [];
    let yValues = [];
    data.forEach((single) => {
      xValues.push(single.frequency);
      yValues.push(single.db)
    })

    let sumAmplitudesLog = [];
    yValues.forEach((amplitude) => {
      sumAmplitudesLog.push(20 * Math.log10(amplitude));
    })

    setChartData([
      {
        x: xValues,
        y: sumAmplitudesLog,
        type: 'bar',
        marker: { color: '#457dff'},
      },
    ]);

  }, [props.data]);

  return (
    <>
      <Plot
        data={chartData}
        layout={{
          xaxis: {
            type: 'log',
            title: 'Frequenza (Hz)',
          },
          yaxis: {
            title: 'Ampiezza',
          },
          title: 'Grafico singoli modi',
          width: 600,
          height: 400,
        }}
      />
    </>
  );
};