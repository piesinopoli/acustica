'use client'
import Cookies from 'js-cookie';
import styles from './page.module.css'
import { useEffect, useRef, useState } from 'react';

import dynamic from 'next/dynamic';
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

import Stanza from '../assets/Stanza.svg'
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
  const [ rt60Medium, setRT60Medium ] = useState('');

  const [ activeStep, setActiveStep ] = useState(0);
  const [ disabledForward, setDisabledForward ] = useState(false);
  const [ disabledBackward, setDisabledBackward] = useState(false);

  const steps = ["Dimensioni Stanza", "Superfici", "Oggetti", "RT60"];

  useEffect(() => {
    const savedRoom = Cookies.get('room');
    const savedSurfaces = Cookies.get('surfaces');
    const savedObjects = Cookies.get('objects');

    if (savedSurfaces) setObjectsSurface(JSON.parse(savedSurfaces));
    if (savedObjects) setObjectsVolumes(JSON.parse(savedObjects));
    if (savedRoom) setRoom(JSON.parse(savedRoom));
  }, []);

  useEffect(() =>{
    setDisabledBackward(activeStep === 0);
    setDisabledForward(activeStep === steps.length - 1 || room.x === '' || room.y === '' || !room.z === '');
  },[room, activeStep, setDisabledBackward, setDisabledForward])

  const movePage = (navbar, nextStep) => {
    if (activeStep === 0){
      Cookies.set('room', JSON.stringify(room));
    }

    if (navbar){
      if ((nextStep > activeStep && !disabledForward) || (nextStep < activeStep && !disabledBackward)){
        setActiveStep(nextStep)
      }
    } else {
      if (!disabledBackward) setActiveStep(nextStep);
      if (!disabledForward) setActiveStep(nextStep);
    }
  }


  return (
    <div className={styles.main}>
      <div className={styles.steps}>
        {steps.map((step, index) => {
          return (<span key={index} onClick={() => movePage(true, index)} className={index === activeStep ? styles.active : undefined}> {step} </span>)
        })}
      </div>
      <div className={styles.formContainer}>
        { activeStep === 0 && <FirstStep room={room} setRoom={setRoom}/> }
        { activeStep === 1 && <SecondStep room={room} objects={objectsSurface} setObjects={setObjectsSurface}/> }
        { activeStep === 2 && <ThirdStep objects={objectsVolumes} setObjects={setObjectsVolumes}/> }
        { activeStep === 3 && <ForthStep room={room} objectsSurface={objectsSurface} objectsVolumes={objectsVolumes} rt60Medium={rt60Medium} setRT60Medium={setRT60Medium}/>}
      </div>
      <div className={styles.arrows}>
        <div className={`${styles.arrowLeft} ${ disabledBackward ? styles.disabled : undefined}`} onClick={() => movePage(false, activeStep - 1)}><Image src={Arrow} alt=''/></div>
        <div className={`${styles.arrowRight} ${ disabledForward ? styles.disabled : undefined}`} onClick={() => movePage(false, activeStep + 1)}><Image src={Arrow} alt=''/></div>
      </div>
    </div>
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
      </div>
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
  
      Cookies.set('surfaces', JSON.stringify(updatedObjects));
      props.setObjects(updatedObjects);
    }
  }

  useEffect(() => {
    if (props.objects.length === 0) {
      const roomX = Number(props.room.x);
      const roomY = Number(props.room.y);
      const roomZ = Number(props.room.z);

      const longWall = roomX * roomZ;
      const shortWall = roomY * roomZ;
      const floorOrCel = roomX * roomY;
      const walls = longWall * 2 + shortWall * 2;
      
      const newObjects = [...props.objects]

      newObjects[0] = { name: "Pavimento", c125: '', c250: '', c500: '', c1000: '', c2000: '', c4000: '', surface: floorOrCel }
      newObjects[1] = { name: "Soffitto", c125: '', c250: '', c500: '', c1000: '', c2000: '',  c4000: '', surface: floorOrCel }
      newObjects[2] = { name: "Muri", c125: '', c250: '', c500: '', c1000: '', c2000: '',  c4000: '', surface: walls }

      props.setObjects(newObjects);
    }
  }, [])

  const addObject = () => {
    const newObjects = [...props.objects]; 
    newObjects.push({ name: '', c125: '', c250: '', c500: '', c1000: '', c2000: '',  c4000: '', surface: '' })
    props.setObjects(newObjects);
  }

  const removeObject = () => {
    const newObjects = [...props.objects];

    if (newObjects.length !== 1){
      newObjects.pop();
      Cookies.set('surfaces', JSON.stringify(newObjects));
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
      <span className='w10'>α 4000Hz</span>
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
        <input type="number" className='w10' value={object.c4000} onChange={handleInput(index, 'c4000')}/>
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
  
      Cookies.set('objects', JSON.stringify(updatedObjects));
      props.setObjects(updatedObjects);
    }
  }

  useEffect(() => {
    const savedSurfaces = Cookies.get('objects');

    if (savedSurfaces) {
      props.setObjects(JSON.parse(savedSurfaces));
    } 
  }, [])

  const addObject = () => {
    const newObjects = [...props.objects]; 
    newObjects.push({ name: '', c125: '', c250: '', c500: '', c1000: '', c2000: '', c4000: '', surface: '', volume: ''})
    props.setObjects(newObjects);
  }

  const removeObject = () => {
    const newObjects = [...props.objects];

    if (newObjects.length !== 1){
      newObjects.pop();
      Cookies.set('objects', JSON.stringify(newObjects));
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
      <span className='w10'>α 4000Hz</span>
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
        <input type="number" className='w10' value={object.c4000} onChange={handleInput(index, 'c4000')}/>
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
  const [ rt60, setRt60 ] = useState([]);
  const [chartData, setChartData] = useState([]);

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
    const objectSurfaceSum4000 = props.objectsVolumes.reduce((accumulator, object) => accumulator + Number(object.surface) * Number(object.c2000), 0) + props.objectsSurface.reduce((accumulator, object) => accumulator + Number(object.surface) * Number(object.c2000), 0);

    const rt125 = Math.round((sabine * emptySapceRoom) / (objectSurfaceSum125) * 100) / 100;
    const rt250 = Math.round((sabine * emptySapceRoom) / (objectSurfaceSum250) * 100) / 100;
    const rt500 = Math.round((sabine * emptySapceRoom) / (objectSurfaceSum500) * 100) / 100;
    const rt1000 = Math.round((sabine * emptySapceRoom) / (objectSurfaceSum1000) * 100) / 100;
    const rt2000 = Math.round((sabine * emptySapceRoom) / (objectSurfaceSum2000) * 100) / 100;
    const rt4000 = Math.round((sabine * emptySapceRoom) / (objectSurfaceSum4000) * 100) / 100;
  
    setRt60([{f: 125, s: rt125}, {f: 250, s: rt250}, {f: 500, s: rt500}, {f: 1000, s: rt1000}, {f: 2000, s: rt2000}, {f: 4000, s: rt4000}]);

    const rt60MediumToSet = (Math.round((rt125 + rt250 + rt500 + rt1000 + rt2000 + rt4000) / 6 * 100) / 100);
    props.setRT60Medium(rt60MediumToSet);
    Cookies.set('rt60Medium', rt60MediumToSet.toString());

    setChartData([
      {
        x: ["125Hz", "250Hz", "500Hz", "1000Hz", "2000Hz", "4000Hz"],
        y: [rt125, rt250, rt500, rt1000, rt2000, rt4000],
        type: "bar",
        marker: { color: '#457dff', width: 1 },
      },
    ]);
    
  },[])

  return(
    <div className={styles.rt60Container}>
      <Plot
        data={chartData}
        layout={{
          xaxis: {
            automargin: true,
            title: 'Frequenza (Hz)',
          },
          yaxis: {
            title: 'Decay (s)',
          },
          title: 'Grafico rt60',
          width: 600,
          height: 400,
        }}
      />
      <div className={styles.bottomContainer}>
        <div className={styles.rt60TextContainer}>
          <div className={styles.miniTitle}>RT60</div>
          <div className={styles.rt60Text}>
            {rt60.length > 0 && rt60.map((single) =>{
              return <span>{single.f}Hz: <strong>{single.s}s</strong></span>
            })}
          </div>
        </div>
        <div className={styles.rt60Medium}>
          <div className={styles.miniTitle}>RT60 Medio</div>
          <div className={styles.rt60Text}>{props.rt60Medium}s</div>
        </div>
      </div>
    </div>
  )
}