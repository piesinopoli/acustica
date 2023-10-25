'use client'
import Link from 'next/link'
import styles from './page.module.css'
import { useEffect, useRef, useState } from 'react';
import Chart from "react-apexcharts";

import Altezza from '../assets/Altezza.svg'
import Lunghezza from '../assets/Lunghezza.svg'
import Profondita from '../assets/Profondita.svg'
import Arrow from '../assets/Arrow.svg'
import Plus from '../assets/Plus.svg'
import Minus from '../assets/Minus.svg'

import Image from 'next/image';

export default function Rtsessanta() {
  const [ room, setRoom ] = useState({x: '', y: '', z: ''});
  const [ objectsSurface, setObjectsSurface ] = useState([]);
  const [ objectsVolumes, setObjectsVolumes ] = useState([]);

  const [ activeStep, setActiveStep ] = useState(0);
  const [ disabledForward, setDisabledForward ] = useState(false);
  const [ disabledBackward, setDisabledBackward] = useState(false);

  const steps = ["Dimensioni Stanza", "Superfici", "Oggetti", "Grafico"];

  useEffect(() =>{
    setDisabledBackward(activeStep === 0);
    setDisabledForward(activeStep === steps.length - 1 || room.x === '' || room.y === '' || !room.z === '');
  },[room, activeStep, setDisabledBackward, setDisabledForward])

  return (
    <>
      <div className='navbar'>
        <Link href={'/'} className='navbarLink'>Tools Acustica</Link>
        <span> / </span>
        <Link href={'/rtsessanta'} className='navbarLink active'>Calcolo RT60</Link>
      </div>
      <div className={styles.main}>
        <div className='rtsessantaForm'>
          <div className='steps'>
            {steps.map((step, index) => {
              return (<span key={index} onClick={() => (index > activeStep && !disabledForward) || (index < activeStep && !disabledBackward) ? setActiveStep(index) :null} className={index === activeStep ? "active" : undefined}> {step} </span>)
            })}
          </div>
          <div className='formContainer'>
            { activeStep === 0 && <FirstStep room={room} setRoom={setRoom}/> }
            { activeStep === 1 && <SecondStep room={room} objects={objectsSurface} setObjects={setObjectsSurface}/> }
            { activeStep === 2 && <ThirdStep objects={objectsVolumes} setObjects={setObjectsVolumes}/> }
            { activeStep === 3 && <ForthStep room={room} objectsSurface={objectsSurface} objectsVolumes={objectsVolumes}/> }
          </div>
          <div className='arrows'>
            <div className={`arrowLeft ${ disabledBackward ? "disabled" : undefined}`} onClick={() => !disabledBackward && setActiveStep(activeStep - 1)}><Image src={Arrow} alt=''/></div>
            <div className={`arrowRight ${ disabledForward ? "disabled" : undefined}`} onClick={() => !disabledForward && setActiveStep(activeStep + 1)}><Image src={Arrow} alt=''/></div>
          </div>
        </div>
      </div>
    </>
  )
}


function FirstStep(props){
  const [ selectedInput, setSelectedInput ] = useState(0);

  const handleInput = (dimension) => {
    return (event) => {
      props.setRoom({ ...props.room, [dimension]: event.target.value });
    }
  }

  return(
    <div className='room'>
      <div className='form'>
        <div className='field'>
          <label>Lunghezza</label>
          <div className='inputContainer'>
            <input onChange={handleInput('x')} onFocus={() => setSelectedInput(0)} value={props.room.x} type='number'/>
            <span>m</span>
          </div>
        </div>
        <div className='field'>
          <label>Profondità</label>
          <div className='inputContainer'>
            <input onChange={handleInput('y')} onFocus={() => setSelectedInput(1)} value={props.room.y} type='number'/>
            <span>m</span>
          </div>
        </div>
        <div className='field'>
          <label>Altezza</label>
          <div className='inputContainer'>
            <input onChange={handleInput('z')} onFocus={() => setSelectedInput(2)} value={props.room.z} type='number'/>
            <span>m</span>
          </div>
        </div>
      </div>
      <Image src={selectedInput === 0 ? Lunghezza : selectedInput === 1 ? Profondita : selectedInput === 2 && Altezza} className='svgStanza' alt=''/>
    </div>
  )
}

function SecondStep(props){
  const handleInput = (index, input) => {
    return (event) => {
      const updatedObjects = [...props.objects];
      updatedObjects[index] = {
        ...updatedObjects[index],
        [input]: event.target.value
      };
  
      props.setObjects(updatedObjects);
    }
  }

  useEffect(() => {
    const roomX = Number(props.room.x);
    const roomY = Number(props.room.y);
    const roomZ = Number(props.room.z);

    const longWall = roomX * roomZ;
    const shortWall = roomY * roomZ;
    const floorOrCel = roomX * roomY;
    const walls = longWall * 2 + shortWall * 2;
    
    const newObjects = [...props.objects]

    newObjects[0] = { name: "Pavimento", c125: '', c250: '', c500: '', c1000: '', c2000: '', surface: floorOrCel }
    newObjects[1] = { name: "Soffitto", c125: '', c250: '', c500: '', c1000: '', c2000: '', surface: floorOrCel }
    newObjects[2] = { name: "Muri", c125: '', c250: '', c500: '', c1000: '', c2000: '', surface: walls }

    props.setObjects(newObjects);

  }, [])

  const addObject = () => {
    const newObjects = [...props.objects]; 
    newObjects.push({ name: '', c125: '', c250: '', c500: '', c1000: '', c2000: '', surface: '' })
    props.setObjects(newObjects);
  }

  const removeObject = () => {
    const newObjects = [...props.objects];

    if (newObjects.length !== 1){
      newObjects.pop();
      props.setObjects(newObjects);
    }
  }

  const inputFields = [];
  inputFields.push(
    <div className='objectRow' key={0}>
      <span className='w20'>Nome</span>
      <span className='w10'>α 125Hz</span>
      <span className='w10'>α 250Hz</span>
      <span className='w10'>α 500Hz</span>
      <span className='w10'>α 1000Hz</span>
      <span className='w10'>α 2000Hz</span>
      <span className='w15'>Superfice</span>
    </div>
  );

  props.objects.forEach((object, index) =>{
    inputFields.push(
      <div className='objectRow' key={index + 1}>
        <input type="string" className='w20' value={object.name} onChange={handleInput(index, 'name')}/>
        <input type="number" className='w10' value={object.c125} onChange={handleInput(index, 'c125')}/>
        <input type="number" className='w10' value={object.c250} onChange={handleInput(index, 'c250')}/>
        <input type="number" className='w10' value={object.c500} onChange={handleInput(index, 'c500')}/>
        <input type="number" className='w10' value={object.c1000} onChange={handleInput(index, 'c1000')}/>
        <input type="number" className='w10' value={object.c2000} onChange={handleInput(index, 'c2000')}/>
        <div className='inputContainer w15'>
          <input type="number" value={object.surface} onChange={handleInput(index, 'surface')}/>
          <span>m²</span>
        </div>
      </div>
    );
  })

  return (
    <div className='objects'>
      <div className='addRowButtons'>
        <div className='minusButton' onClick={removeObject}>
          <Image src={Minus} alt=''/>
        </div>
        <div className='plusButton'  onClick={addObject}>
          <Image src={Plus} alt=''/>
        </div>
      </div>
      <div className='form'>
        {inputFields}
      </div>
    </div>
  );
}

function ThirdStep(props){
  const handleInput = (index, input) => {
    return (event) => {
      const updatedObjects = [...props.objects];
      updatedObjects[index] = {
        ...updatedObjects[index],
        [input]: event.target.value
      };
  
      props.setObjects(updatedObjects);
    }
  }

  const addObject = () => {
    const newObjects = [...props.objects]; 
    newObjects.push({ name: '', c125: '', c250: '', c500: '', c1000: '', c2000: '', surface: '' })
    props.setObjects(newObjects);
  }

  const removeObject = () => {
    const newObjects = [...props.objects];

    if (newObjects.length !== 1){
      newObjects.pop();
      props.setObjects(newObjects);
    }
  }

  const inputFields = [];
  inputFields.push(
    <div className='objectRow' key={0}>
      <span className='w20'>Nome</span>
      <span className='w10'>α 125Hz</span>
      <span className='w10'>α 250Hz</span>
      <span className='w10'>α 500Hz</span>
      <span className='w10'>α 1000Hz</span>
      <span className='w10'>α 2000Hz</span>
      <span className='w15'>Superfice</span>
      <span className='w15'>Volume</span>
    </div>
  );
  props.objects.forEach((object, index) =>{
    inputFields.push(
      <div className='objectRow' key={index + 1}>
        <input type="string" className='w20' value={object.name} onChange={handleInput(index, 'name')}/>
        <input type="number" className='w10' value={object.c125} onChange={handleInput(index, 'c125')}/>
        <input type="number" className='w10' value={object.c250} onChange={handleInput(index, 'c250')}/>
        <input type="number" className='w10' value={object.c500} onChange={handleInput(index, 'c500')}/>
        <input type="number" className='w10' value={object.c1000} onChange={handleInput(index, 'c1000')}/>
        <input type="number" className='w10' value={object.c2000} onChange={handleInput(index, 'c2000')}/>
        <div className='inputContainer w15'>
          <input type="number" value={object.surface} onChange={handleInput(index, 'surface')}/>
          <span>m²</span>
        </div>
        <div className='inputContainer w15'>
          <input type="number" value={object.volume} onChange={handleInput(index, 'volume')}/>
          <span>m³</span>
        </div>
      </div>
    );
  })

  return (
    <div className='objects'>
      <div className='addRowButtons'>
        <div className='minusButton' onClick={removeObject}>
          <Image src={Minus} alt=''/>
        </div>
        <div className='plusButton'  onClick={addObject}>
          <Image src={Plus} alt=''/>
        </div>
      </div>
      <div className='form'>
        {inputFields}
      </div>
    </div>
  );
}

function ForthStep(props){
  const [ rt60, setRt60 ] = useState([undefined, undefined, undefined, undefined, undefined]);
  const [ series, setSeries ] = useState(null);

  useEffect(() => {
    const sabine = 0.161;
    const volumeRoom = Number(props.room.x) * Number(props.room.y) * Number(props.room.z);
    const objectsVolume = props.objectsVolumes.reduce((accumulator, object) => accumulator + Number(object.volume), 0);

    const emptySapceRoom = volumeRoom - objectsVolume;

    const objectSurfaceSum125 = props.objectsVolumes.reduce((accumulator, object) => accumulator + Number(object.surface) * Number(object.c125), 0) + props.objectsSurface.reduce((accumulator, object) => accumulator + Number(object.surface) * Number(object.c125), 0);
    const objectSurfaceSum250 = props.objectsVolumes.reduce((accumulator, object) => accumulator + Number(object.surface) * Number(object.c250), 0) + props.objectsSurface.reduce((accumulator, object) => accumulator + Number(object.surface) * Number(object.c250), 0);
    const objectSurfaceSum500 = props.objectsVolumes.reduce((accumulator, object) => accumulator + Number(object.surface) * Number(object.c500), 0) + props.objectsSurface.reduce((accumulator, object) => accumulator + Number(object.surface) * Number(object.c500), 0);
    const objectSurfaceSum1000 = props.objectsVolumes.reduce((accumulator, object) => accumulator + Number(object.surface) * Number(object.c1000), 0) + props.objectsSurface.reduce((accumulator, object) => accumulator + Number(object.surface) * Number(object.c1000), 0);
    const objectSurfaceSum2000 = props.objectsVolumes.reduce((accumulator, object) => accumulator + Number(object.surface) * Number(object.c2000), 0) + props.objectsSurface.reduce((accumulator, object) => accumulator + Number(object.surface) * Number(object.c2000), 0);
    
    const rt125 = Math.round((sabine * emptySapceRoom) / (objectSurfaceSum125) * 100) / 100;
    const rt250 = Math.round((sabine * emptySapceRoom) / (objectSurfaceSum250) * 100) / 100;
    const rt500 = Math.round((sabine * emptySapceRoom) / (objectSurfaceSum500) * 100) / 100;
    const rt1000 = Math.round((sabine * emptySapceRoom) / (objectSurfaceSum1000) * 100) / 100;
    const rt2000 = Math.round((sabine * emptySapceRoom) / (objectSurfaceSum2000) * 100) / 100;

    
    setRt60([rt125, rt250, rt500, rt1000, rt2000]);
    setSeries([{
      name: "rt60s",
      data: [{ x: '125 Hz', y: rt125 }, { x: '250 Hz', y: rt250 }, { x: '500 Hz', y: rt500 }, { x: '1000 Hz', y: rt1000 }, { x: '2000 Hz', y: rt2000 }]
    }])
    
  },[])

  return(
    <div className='rt60'>
      {series &&
        <Chart
          options={{
            chart: {
              type: 'bar',
              height: 380
            },
            fill: {
              colors: ['#457dff', '#fff', '#fff'],
            },
            chart: {
              foreColor: '#fff',
              selection: {
                enabled: false,
              }
            }
          }} 
          series={series}
          type="bar"
          width="500"
          
        />
      }
    </div>
  )
}