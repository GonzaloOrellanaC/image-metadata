import React, { useState, useRef } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSpinner, IonText, IonList, IonItem, IonLabel, IonGrid, IonRow, IonCol, IonToggle, IonItemDivider, IonAccordion, IonAccordionGroup, IonButton, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonModal } from '@ionic/react';
import { colorFill, copyOutline, close } from 'ionicons/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Zoom } from 'swiper/modules';
// import 'swiper/css'; // Commented out due to import error
import './Home.css';

interface MetadataItem {
  key: string;
  value: any;
}

const formatValue = (value: any, key?: string, gpsFormat?: 'decimal' | 'dms'): string => {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  if (key && key.startsWith('GPS')) {
    return formatGpsValue(value, key, gpsFormat);
  }
  if (Array.isArray(value)) {
    return value.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(', ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

const toNumber = (val: any): number => {
  if (typeof val === 'number') return val;
  if (typeof val === 'object' && val.numerator !== undefined && val.denominator !== undefined) {
    return val.numerator / val.denominator;
  }
  return parseFloat(val) || 0;
};

const formatGpsValue = (value: any, key: string, gpsFormat?: 'decimal' | 'dms'): string => {
  if (key === 'GPSAltitude') {
    const alt = toNumber(value);
    return `${alt.toFixed(2)} meters`;
  }
  if (key === 'GPSAltitudeRef') {
    return value === 0 ? 'Above sea level' : 'Below sea level';
  }
  if (key === 'GPSLatitude' || key === 'GPSLongitude') {
    if (Array.isArray(value) && value.length === 3) {
      const d = toNumber(value[0]);
      const m = toNumber(value[1]);
      const s = toNumber(value[2]);
      if (gpsFormat === 'decimal') {
        const decimal = d + m / 60 + s / 3600;
        return decimal.toFixed(6);
      } else {
        return `${d}° ${m}' ${s.toFixed(2)}"`;
      }
    }
  }
  if (Array.isArray(value)) {
    return value.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(', ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

const Home: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<MetadataItem[]>([]);
  const [gpsMetadata, setGpsMetadata] = useState<MetadataItem[]>([]);
  const [gpsFormat, setGpsFormat] = useState<'decimal' | 'dms'>('decimal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    // Revoke previous URL to free memory
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setFile(selectedFile);
    setImageUrl(URL.createObjectURL(selectedFile));
    setError(null);
    fileInputRef.current!.value = ''; // Reset input to allow re-selecting same file
    uploadFile(selectedFile);
  };

  const uploadFile = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await fetch('http://localhost:5051/api/photo/metadata', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      const allMetadata = (data.metadata || []).filter((item: MetadataItem) => item.key !== 'MakerNote' && item.key !== 'UserComment');
      const gpsFields = allMetadata.filter((item: MetadataItem) => item.key.startsWith('GPS'));
      const generalFields = allMetadata.filter((item: MetadataItem) => !item.key.startsWith('GPS'));
      setMetadata(generalFields);
      setGpsMetadata(gpsFields);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setFile(null);
    setImageUrl(null);
    setMetadata([]);
    setGpsMetadata([]);
    setError(null);
    fileInputRef.current!.value = '';
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="home-content ion-padding">
        <IonGrid style={{height: 'calc(100vh - 190px)' }}>
          <IonRow>
            <IonCol sizeXs='12' sizeMd='6'>
              {!file ? (
                <div className="upload-area" onDrop={handleDrop} onDragOver={handleDragOver} onClick={handleClick}>
                  <div className="upload-icon">📷</div>
                  <p>Drag & drop an image here or click to select</p>
                </div>
              ) : (
                <div className="image-display">
                  <img src={imageUrl!} alt="Uploaded" className="uploaded-image" onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }} />
                  <p className="image-name">{file!.name}</p>
                  <div className="button-group">
                    <button className="change-button" onClick={handleChangePhoto}>
                      Change Photo
                    </button>
                    <button className="clear-button" onClick={handleClear}>
                      Clear
                    </button>
                  </div>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </IonCol>
            <IonCol style={{overflowY: 'auto', height: 'calc(100vh - 190px)'}}>
              {loading && (
                <div className="loading">
                  <IonSpinner name="crescent" />
                  <IonText>Extracting metadata...</IonText>
                </div>
              )}
              {error && (
                <div className="error">
                  <IonText color="danger">{error}</IonText>
                </div>
              )}
              <div>
                <IonAccordionGroup>
                  {metadata.length > 0 && (
                    <IonAccordion value="exif">
                      <IonItem slot="header">
                        <IonLabel>EXIF Metadata</IonLabel>
                      </IonItem>
                      <div slot="content">
                        <IonList>
                          {metadata.map((item, index) => {
                            const formatted = formatValue(item.value, item.key);
                            return (
                              <IonItem key={index}>
                                <IonLabel>
                                  <h3>{item.key}</h3>
                                  <p style={{ whiteSpace: 'pre-wrap' }}>{formatted}</p>
                                </IonLabel>
                                <IonButton slot="end" fill="clear" onClick={() => handleCopy(formatted)}>
                                  <IonIcon style={{color: 'black'}} icon={copyOutline} />
                                </IonButton>
                              </IonItem>
                            );
                          })}
                        </IonList>
                      </div>
                    </IonAccordion>
                  )}
                  {gpsMetadata.length > 0 ? (
                    <IonAccordion value="gps">
                      <IonItem slot="header">
                        <IonLabel>GPS Information</IonLabel>
                      </IonItem>
                      <div slot="content">
                        <IonItemDivider>
                          <IonLabel>GPS Format</IonLabel>
                          <IonToggle
                            checked={gpsFormat === 'decimal'}
                            onIonChange={(e) => setGpsFormat(e.detail.checked ? 'decimal' : 'dms')}
                            slot="start"
                          />
                          <IonText slot="start">{gpsFormat === 'decimal' ? 'Decimal' : 'DMS'}</IonText>
                        </IonItemDivider>
                        <IonList>
                          {gpsMetadata.map((item, index) => {
                            const formatted = formatValue(item.value, item.key, gpsFormat);
                            return (
                              <IonItem key={index}>
                                <IonLabel>
                                  <h3>{item.key}</h3>
                                  <p style={{ whiteSpace: 'pre-wrap' }}>{formatted}</p>
                                </IonLabel>
                                <IonButton slot="end" fill="clear" onClick={() => handleCopy(formatted)}>
                                  <IonIcon style={{color: 'black'}} icon={copyOutline} />
                                </IonButton>
                              </IonItem>
                            );
                          })}
                        </IonList>
                      </div>
                    </IonAccordion>
                  ) : 
                  <IonCard className="service-info-card">
                    <IonCardHeader>
                      <IonCardTitle className="service-title">🚀 Image Metadata Extractor</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <p className="service-description">
                        <strong>Descubre los secretos ocultos en tus fotos con tecnología avanzada.</strong><br />
                        Nuestro extractor de metadatos EXIF analiza imágenes de manera instantánea y precisa, revelando información técnica como fecha de captura, configuración de cámara, ubicación GPS y más.
                      </p>
                      <p className="service-features">
                        ✨ <strong>Procesamiento en tiempo real:</strong> Extrae metadatos al instante sin demoras.<br />
                        🔒 <strong>Privacidad garantizada:</strong> No almacenamos tus imágenes ni datos. Todo se procesa localmente y se elimina automáticamente.<br />
                        📸 <strong>Una foto a la vez:</strong> Enfocado en análisis individual para máxima eficiencia.<br />
                        🛠️ <strong>Tecnología pura:</strong> Utilizamos algoritmos especializados de procesamiento de imágenes, sin recurrir a inteligencia artificial.
                      </p>
                      <p className="service-note">
                        Sube tu imagen y explora su metadata con precisión técnica. ¡Es rápido, seguro y gratuito!
                      </p>
                    </IonCardContent>
                  </IonCard>
                  }
                </IonAccordionGroup>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
        {/* Placeholder for advertising - Monetization area */}
        <div id="ads-container" style={{ margin: '20px 0', textAlign: 'center', minHeight: '100px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IonText color="medium">Espacio para publicidad - Monetización</IonText>
        </div>
      </IonContent>

      {/* Fullscreen Modal for Image */}
      <IonModal style={{'--height': '100vh', '--width': '100vw'}} isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
        <IonContent className="modal-content" style={{ '--padding': '0' }}>
          {imageUrl && (
            <Swiper
              modules={[Zoom]}
              zoom={{ maxRatio: 3 }}
              style={{ height: '100%', backgroundColor: 'black' }}
            >
                            <SwiperSlide style={{ height: '100%', position: 'relative' }}>
                <IonButton style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }} fill="clear" onClick={() => setIsModalOpen(false)}>
                  <IonIcon style={{color: 'white'}} icon={close} />
                </IonButton>
                <div className="swiper-zoom-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
                  <img src={imageUrl} alt="Full size" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              </SwiperSlide>
            </Swiper>
          )}
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default Home;
