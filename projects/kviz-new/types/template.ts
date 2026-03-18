// types/template.ts
// Konfigurace šablony pro hospodský kvíz

export interface TemplateConfig {
  // Identifikace
  id: string
  name: string
  description?: string
  
  // Základní styling
  background: {
    type: 'color' | 'image' | 'gradient'
    value: string // #hex, url(...), linear-gradient(...)
    overlayColor?: string // barva přes obrázek (pro lepší čitelnost textu)
  }
  
  colors: {
    primary: string // hlavní barva (čísla, zvýraznění)
    secondary: string // sekundární barva
    correct: string // červená pro správné odpovědi (#e53e3e)
    text: string // barva textu (#ffffff pro tmavé pozadí, #000000 pro světlé)
    answerBg: string // pozadí pro odpovědi (s průhledností)
    answerBorder: string // okraj odpovědí
  }
  
  fonts: {
    question: FontConfig
    answer: FontConfig
    number: FontConfig
    label: FontConfig // pro "Bonusová", "Audio", atd.
  }
  
  // Layout pozice (v % viewportu)
  layout: {
    // Číslo otázky (1-10 nebo "BO")
    questionNumber: {
      position: 'top-left' | 'top-right' | 'top-center'
      offsetX: string // "10%" nebo "20px"
      offsetY: string // "5%" nebo "15px"
      size: string // "3rem" nebo "48px"
    }
    
    // Číslo kola
    roundNumber: {
      position: 'bottom-left' | 'bottom-right' | 'bottom-center'
      offsetX: string
      offsetY: string
      size: string
    }
    
    // Text otázky
    questionText: {
      top: string // "%" od horního okraje
      left: string
      right: string
      maxWidth: string // "80%" nebo "1200px"
      textAlign: 'left' | 'center' | 'right'
    }
    
    // Obrázek (pokud otázka má obrázek)
    image: {
      top: string // pod otázkou
      left: string
      width: string // "60%" nebo "800px"
      height: string // "auto" nebo "400px"
      maxHeight: string // "50vh"
    }
    
    // Odpovědi - různé layouty pro různé typy otázek
    answers: {
      // Pro AB/ABCDEF otázky
      grid: {
        top: string // pod obrázkem/otázkou
        bottom: string // nad číslem kola
        left: string
        right: string
        columns: 2 | 3 // 2 pro AB, 3 pro ABCDEF
        gap: string // "1rem" nebo "20px"
      }
      
      // Pro jednoduché odpovědi
      single: {
        top: string
        left: string
        right: string
        textAlign: 'left' | 'center' | 'right'
      }
      
      // Pro bonusové otázky (postupné odhalování)
      bonus: {
        top: string
        left: string
        right: string
        gap: string // mezera mezi postupně odhalovanými odpověďmi
      }
    }
    
    // Media
    media: {
      audio: {
        top: string // pod otázkou
        left: string
        width: string // "300px" nebo "40%"
      }
      
      video: {
        thumbnail: {
          top: string
          left: string
          width: string // "400px" nebo "50%"
          height: string // "225px" (16:9)
        }
        fullscreen: boolean // true = kliknutí spustí fullscreen
      }
    }
  }
  
  // Animace
  animations: {
    enabled: boolean
    answerReveal: 'fade' | 'slide' | 'highlight' | 'none'
    bonusReveal: 'sequential' | 'all-at-once' | 'none' // postupné odhalování
    transition: 'fade' | 'slide' | 'none' // přechod mezi otázkami
    duration: number // ms
  }
  
  // Speciální stránky
  specialPages: {
    intro: {
      background?: string // speciální pozadí pro úvod
      titlePosition: { top: string; left: string; right: string }
      subtitlePosition: { top: string; left: string; right: string }
    }
    separator: {
      text: string // "ODPOVĚDI" nebo vlastní text
      style: 'box' | 'line' | 'text-only'
      color: string
    }
    outro: {
      background?: string
      titlePosition: { top: string; left: string; right: string }
    }
  }
}

export interface FontConfig {
  family: string
  size: string
  weight: string // "normal", "bold", "600"
  color?: string // přebíjí globální text color
}

// Výchozí šablona
export const DEFAULT_TEMPLATE: TemplateConfig = {
  id: 'default',
  name: 'Výchozí šablona',
  description: 'Univerzální šablona pro hospodské kvízy',
  
  background: {
    type: 'color',
    value: '#0f172a', // tmavě modrá
    overlayColor: 'rgba(0, 0, 0, 0.3)'
  },
  
  colors: {
    primary: '#0ea5e9', // světle modrá
    secondary: '#f97316', // oranžová
    correct: '#e53e3e', // červená
    text: '#ffffff',
    answerBg: 'rgba(255, 255, 255, 0.05)',
    answerBorder: 'rgba(255, 255, 255, 0.1)'
  },
  
  fonts: {
    question: {
      family: "'IBM Plex Sans', sans-serif",
      size: '2.5rem',
      weight: 'bold'
    },
    answer: {
      family: "'IBM Plex Sans', sans-serif",
      size: '1.5rem',
      weight: 'normal'
    },
    number: {
      family: "'IBM Plex Sans', sans-serif",
      size: '3rem',
      weight: 'bold',
      color: '#0ea5e9'
    },
    label: {
      family: "'IBM Plex Sans', sans-serif",
      size: '1rem',
      weight: 'bold'
    }
  },
  
  layout: {
    questionNumber: {
      position: 'top-right',
      offsetX: '5%',
      offsetY: '5%',
      size: '3rem'
    },
    roundNumber: {
      position: 'bottom-left',
      offsetX: '5%',
      offsetY: '5%',
      size: '2rem'
    },
    questionText: {
      top: '15%',
      left: '10%',
      right: '10%',
      maxWidth: '80%',
      textAlign: 'center'
    },
    image: {
      top: '40%',
      left: '20%',
      width: '60%',
      height: 'auto',
      maxHeight: '40vh'
    },
    answers: {
      grid: {
        top: '50%',
        bottom: '15%',
        left: '10%',
        right: '10%',
        columns: 2,
        gap: '1rem'
      },
      single: {
        top: '50%',
        left: '20%',
        right: '20%',
        textAlign: 'center'
      },
      bonus: {
        top: '50%',
        left: '20%',
        right: '20%',
        gap: '1rem'
      }
    },
    media: {
      audio: {
        top: '40%',
        left: '30%',
        width: '40%'
      },
      video: {
        thumbnail: {
          top: '40%',
          left: '25%',
          width: '50%',
          height: '225px'
        },
        fullscreen: true
      }
    }
  },
  
  animations: {
    enabled: true,
    answerReveal: 'highlight',
    bonusReveal: 'sequential',
    transition: 'fade',
    duration: 500
  },
  
  specialPages: {
    intro: {
      titlePosition: { top: '30%', left: '10%', right: '10%' },
      subtitlePosition: { top: '45%', left: '10%', right: '10%' }
    },
    separator: {
      text: 'ODPOVĚDI',
      style: 'box',
      color: '#0ea5e9'
    },
    outro: {
      titlePosition: { top: '40%', left: '10%', right: '10%' }
    }
  }
}