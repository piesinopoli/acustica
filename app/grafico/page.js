'use client'
import dynamic from 'next/dynamic';
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });
import { useEffect, useState } from 'react';
import styles from './page.module.css'

import Stanza from '../assets/Stanza.svg'
import Altezza from '../assets/Altezza.svg'
import Lunghezza from '../assets/Lunghezza.svg'
import Profondita from '../assets/Profondita.svg'

import Image from 'next/image';

export default function RisonanzeStanza(){
  const [ room, setRoom ] = useState({x: '', y: '', z: ''});
  const [ rt60, setRt60 ] = useState(0.33);

  const [ data, setData ] = useState([]);

  const soundSpeed = 340;

  const handleClick = () => {
    const volumeRoom = Number(room.x) * Number(room.y) * Number(room.z);

    if (volumeRoom && rt60){
      const fineRegioneB = 1875 * Math.sqrt(rt60/volumeRoom);

      const modiAssiali = [];
      const modiTangenziali = [];
      const modiObliqui = [];

      for (let i = 0; i < 10; i++){
        for (let j = 0; j < 10; j++){
          for (let k = 0; k < 10; k++){
            const frequency = (soundSpeed/2) * Math.sqrt(Math.pow(i/room.x, 2) + Math.pow(j/room.y, 2) + Math.pow(k/room.z, 2));
            let ampiezza;

            if ((frequency < fineRegioneB)) {
              if ((i != 0 && j == 0 && k == 0) || (i == 0 && j != 0 && k == 0) || (i == 0 && j == 0 && k != 0)){
                modiAssiali.push({frequency: frequency, db: 100/(i + j + k)});
              }
              if ((i != 0 && j != 0 && k == 0) || (i != 0 && j == 0 && k != 0) || (i == 0 && j != 0 && k != 0)){
                if ( i === j || j === k || i === k ){
                  ampiezza = 70 / ((i + j + k) / 2);
                } else {
                  const media = (i + j + k) / 2;
                  const numSucc = 70 / Math.max(i, j, k);

                  ampiezza = numSucc + (numSucc / media);
                }
                modiTangenziali.push({frequency: frequency, db: ampiezza});
              }
              if (i != 0 && j != 0 && k != 0) {
                if ( i == j == k ){
                  ampiezza = 50 / ((i + j + k) / 3);
                } else {
                  const media = (i + j + k) / 3;
                  const numSucc = 50 / Math.max(i, j, k);

                  ampiezza = numSucc + (numSucc / media);
                }
                modiObliqui.push({frequency: frequency, db: ampiezza});
              }
            }
          }
        }
      }

      const allModi = modiAssiali.concat(modiTangenziali, modiObliqui);

      const dataToSet = [];
      const campanatura = 2.2 / rt60;
      allModi.forEach((modo) => {
        dataToSet.push([modo.frequency - (campanatura / 2), modo.frequency + (campanatura / 2), modo.db])
      })
    
      setData(dataToSet);
    } else {
      setData([]);
    }
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.leftContainer}>
        <FormRoom room={room} setRoom={setRoom} rt60={rt60} setRt60={setRt60}/>
        <button onClick={handleClick} className={`button ${(!room.x || !room.y || !room.z || !rt60) ? "disabled" : "enabled"}`} disabled={!room.x || !room.y || !room.z || !rt60}>Calcolo</button>
      </div>
      <div className={styles.rightContainer}>
        {data.length > 0 ? <Grafico data={data}/> : <span className={styles.error}>Inserisci tutti i dati per visualizzare il grafico</span>}
      </div>
    </div>
  )
}


function FormRoom(props){
  const [ selectedInput, setSelectedInput ] = useState(0);

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
          <label>RT60 Medio</label>
          <div className='inputContainer'>
            <input onChange={(event) => props.setRt60(event.target.value)}  value={props.rt60} type='number'/>
            <span>s</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Grafico(props) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const data = props.data;

    const startTimes = data.map(([start]) => start);
    const endTimes = data.map(([_, end]) => end);

    const totalPoints = 10000;
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
        marker: { color: 'lightblue', width: 1 },
      },
    ]);

  }, [props.data]);

  return (
    <div>
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
          title: 'Grafico frequenze con ampiezze sommate',
        }}
      />
    </div>
  );
};