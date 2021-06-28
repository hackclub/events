const theme = {
  useCustomProperties: true,
  initialColorMode: 'light',
  colors: {
    text: '#fff',
    background: '#011C36',
    primary: '#fff',
    secondary: '#ffd993',
    muted: '#e0e0e0',
    sunken: '#011428',
    highlight: '#3c3c3c',
    gray: '#6c6c6c',
    sheet: '#c44d4d',
    red: '#be100e',
    accent: '#ffd993',
    
  },
  fonts: {
    body: "'Fraunces', monospace",
    heading: "'Fraunces', monospace",
    monospace: 'monospace'
  },
  lineHeights: {
    limit: 0.875,
    title: 1,
    heading: 1.125,
    subheading: 1.25,
    caption: 1.375,
    body: 1.5
  },
  fontWeights: {
    body: 400,
    bold: 700,
    heading: 700
  },
  letterSpacings: {
    title: '-0.009em',
    headline: '0.009em'
  },
  sizes: {
    widePlus: 2048,
    wide: 1536,
    layoutPlus: 1200,
    layout: 1024,
    copyUltra: 980,
    copyPlus: 700,
    copy: 680,
    narrowPlus: 600,
    narrow: 512
  },
  radii: {
    small: 4,
    default: 8,
    extra: 12,
    ultra: 16,
    circle: 99999
  },
  shadows: {
    text: '0 1px 2px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.125)',
    small: '0 1px 2px rgba(0, 0, 0, 0.0625), 0 2px 4px rgba(0, 0, 0, 0.0625)',
    card: '0 4px 8px rgba(0, 0, 0, 0.125)',
    elevated: '0 1px 2px rgba(0, 0, 0, 0.0625), 0 8px 12px rgba(0, 0, 0, 0.125)'
  },
  text: {
    heading: {
      fontWeight: 'bold',
      lineHeight: 'heading',
      mt: 0,
      mb: 0
    },
    ultratitle: {
      fontSize: [5, 6, 7],
      lineHeight: 'limit',
      fontWeight: 'bold',
      letterSpacing: 'title'
    },
    title: {
      fontSize: [5, 5, 6],
      fontWeight: 'bold',
      letterSpacing: 'title',
      lineHeight: 'title'
    },
    subtitle: {
      mt: 3,
      fontSize: [2, 3],
      fontWeight: 'body',
      letterSpacing: 'headline',
      lineHeight: 'subheading'
    },
    headline: {
      variant: 'text.heading',
      letterSpacing: 'headline',
      lineHeight: 'heading',
      fontSize: 4,
      mt: 3,
      mb: 3
    },
    subheadline: {
      variant: 'text.heading',
      letterSpacing: 'headline',
      fontSize: 2,
      mt: 0,
      mb: 3
    },
    eyebrow: {
      color: 'muted',
      fontSize: [3, 4],
      fontWeight: 'heading',
      letterSpacing: 'headline',
      lineHeight: 'subheading',
      textTransform: 'uppercase',
      mt: 0,
      mb: 2
    },
    lead: {
      fontSize: [2, 3],
      my: [2, 3]
    },
    caption: {
      color: 'muted',
      fontWeight: 'medium',
      letterSpacing: 'headline',
      lineHeight: 'caption'
    }
  },
  alerts: {
    primary: {
      borderRadius: 'default',
      bg: 'orange',
      color: 'background',
      fontWeight: 'body'
    }
  },
  badges: {
    pill: {
      borderRadius: 'circle',
      px: 3,
      py: 1,
      fontSize: 1
    },
    outline: {
      variant: 'badges.pill',
      bg: 'transparent',
      border: '1px solid',
      borderColor: 'currentColor',
      fontWeight: 'body'
    }
  },
  buttons: {
    primary: {
      cursor: 'pointer',
      bg: 'background',
      color: 'text',
      fontFamily: 'inherit',
      borderRadius: 'base',
      border: '3px solid black',
      ':hover,:focus': {
        boxShadow: 'card',
        bg: '#011428'
      }
    },
    lg: {
      variant: 'buttons.primary',
      fontSize: 3,
      lineHeight: 'title',
      px: 4,
      py: 3
    },
    outline: {
      variant: 'buttons.primary',
      bg: 'transparent',
      color: 'primary',
      border: '2px solid currentColor'
    },
    outlineLg: {
      variant: 'buttons.primary',
      bg: 'transparent',
      color: 'primary',
      border: '2px solid currentColor',
      lineHeight: 'title',
      fontSize: 3,
      px: 4,
      py: 3
    },
    cta: {
      variant: 'buttons.primary',
      fontSize: 2,
      backgroundImage: t => t.util.gx('orange', 'red')
    },
    ctaLg: {
      variant: 'buttons.primary',
      lineHeight: 'title',
      fontSize: 3,
      px: 4,
      py: 3,
      backgroundImage: t => t.util.gx('orange', 'red')
    }
  },
  cards: {
    primary: {
      bg: 'elevated',
      color: 'text',
      p: [3, 4],
      borderRadius: 'extra',
      boxShadow: 'card',
      overflow: 'hidden'
    },
    sunken: {
      bg: 'sunken',
      p: [3, 4],
      borderRadius: 'extra'
    },
    interactive: {
      variant: 'cards.primary',
      textDecoration: 'none',
      WebkitTapHighlightColor: 'transparent',
      transition: 'transform .125s ease-in-out, box-shadow .125s ease-in-out',
      ':hover,:focus': {
        transform: 'scale(1.0625)',
        boxShadow: 'elevated'
      }
    },
    center: {
      variant: 'cards.primary',
      margin: '0',
      position: 'absolute',
      top: '50%',
      left: '50%',
      bg: 'background',
      transform: 'translate(-50%, -50%)'
    }
  },
  forms: {
    input: {
      bg: 'elevated',
      color: 'text',
      fontFamily: 'inherit',
      borderRadius: 'base',
      border: '1px solid black',
      '::-webkit-input-placeholder': { color: 'placeholder' },
      '::-moz-placeholder': { color: 'placeholder' },
      ':-ms-input-placeholder': { color: 'placeholder' },
      '&[type="search"]::-webkit-search-decoration': { display: 'none' }
    },
    textarea: { variant: 'forms.input' },
    select: { variant: 'forms.input' },
    label: {
      color: 'text',
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'left',
      lineHeight: 'caption',
      fontSize: 2
    },
    labelHoriz: {
      color: 'text',
      display: 'flex',
      alignItems: 'center',
      textAlign: 'left',
      lineHeight: 'caption',
      fontSize: 2,
      svg: { color: 'muted' }
    },
    slider: {
      color: 'primary'
    },
    hidden: {
      position: 'absolute',
      height: '1px',
      width: '1px',
      overflow: 'hidden',
      clip: 'rect(1px, 1px, 1px, 1px)',
      whiteSpace: 'nowrap'
    }
  },
  layout: {
    container: {
      maxWidth: ['layout', null, 'layout'],
      width: '100%',
      mx: 'auto',
      px: 3
    },
    wide: {
      variant: 'layout.container',
      maxWidth: [null, null, null]
    },
    copy: {
      variant: 'layout.container',
      maxWidth: ['copy', null, 'copyPlus']
    },
    narrow: {
      variant: 'layout.container',
      maxWidth: ['narrow', null, 'narrowPlus']
    }
  },
  styles: {
    root: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body',
      color: 'text',
      margin: 0,
      minHeight: '100vh',
      textRendering: 'optimizeLegibility',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    },
    h1: {
      variant: 'text.heading',
      fontSize: 5,
      fontWeight: '800'
    },
    h2: {
      variant: 'text.heading',
      fontSize: 4
    },
    h3: {
      variant: 'text.heading',
      fontSize: 3
    },
    h4: {
      variant: 'text.heading',
      fontSize: 2
    },
    h5: {
      variant: 'text.heading',
      fontSize: 1
    },
    h6: {
      variant: 'text.heading',
      fontSize: 0
    },
    p: {
      color: 'text',
      fontWeight: 'body',
      lineHeight: 'body',
      my: 3
    },
    img: {
      maxWidth: '100%'
    },
    hr: {
      border: 0,
      borderBottom: '1px solid',
      borderColor: 'border'
    },
    a: {
      textDecoration: 'underline',
      color: 'white'
    },
    pre: {
      fontFamily: 'monospace',
      fontSize: 1,
      p: 3,
      color: 'text',
      bg: 'sunken',
      overflow: 'auto',
      borderRadius: 'default',
      code: {
        color: 'inherit',
        mx: 0,
        px: 0
      }
    },
    code: {
      fontFamily: 'monospace',
      fontSize: 'inherit',
      color: 'purple',
      bg: 'sunken',
      borderRadius: 'small',
      mx: 1,
      px: 1
    },
    'p > code, li > code': {
      color: 'purple',
      fontSize: '0.875em'
    },
    'p > a > code, li > a > code': {
      color: 'white',
      fontSize: '0.875em',
      textDecoration: 'none'
    },
    li: {
      my: 2
    },
    table: {
      width: '100%',
      my: 4,
      borderCollapse: 'separate',
      borderSpacing: 0,
      'th,td': {
        textAlign: 'left',
        py: '4px',
        pr: '4px',
        pl: 0,
        borderColor: 'border',
        borderBottomStyle: 'solid'
      }
    },
    th: {
      verticalAlign: 'bottom',
      borderBottomWidth: '2px'
    },
    td: {
      verticalAlign: 'top',
      borderBottomWidth: '1px'
    },
    main: {
      backgroundColor: '#011C36'
    }
  }
}

export default theme