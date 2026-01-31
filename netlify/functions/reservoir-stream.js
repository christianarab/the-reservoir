// Netlify Function - /netlify/functions/reservoir-stream.js
// Fetches from multiple sources and returns unified fragment stream

const axios = require('axios');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    // Fetch from multiple sources in parallel
    const [poetryData, quotesData, zenData] = await Promise.allSettled([
      fetchPoetry(),
      fetchQuotes(),
      fetchZen()
    ]);

    const fragments = [];

    // Process PoetryDB results
    if (poetryData.status === 'fulfilled' && poetryData.value) {
      const poems = poetryData.value;
      poems.forEach(poem => {
        // Extract 1-2 random lines from each poem
        const lines = poem.lines.filter(line => line.trim().length > 20);
        if (lines.length > 0) {
          const randomLine = lines[Math.floor(Math.random() * lines.length)];
          fragments.push({
            text: randomLine,
            source: poem.author,
            category: 'poetry',
            api: 'poetrydb'
          });
        }
      });
    }

    // Process Quotable results
    if (quotesData.status === 'fulfilled' && quotesData.value) {
      quotesData.value.forEach(quote => {
        fragments.push({
          text: quote.content,
          source: quote.author,
          category: 'philosophy',
          api: 'quotable'
        });
      });
    }

    // Process Zen Quotes
    if (zenData.status === 'fulfilled' && zenData.value) {
      zenData.value.forEach(quote => {
        fragments.push({
          text: quote.q,
          source: quote.a,
          category: 'sacred',
          api: 'zenquotes'
        });
      });
    }

    // Shuffle and limit to 20 fragments
    const shuffled = fragments.sort(() => 0.5 - Math.random()).slice(0, 20);

    // Add some digital/meta fragments occasionally
    if (Math.random() > 0.5) {
      shuffled.push(getDigitalFragment());
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        fragments: shuffled,
        generatedAt: new Date().toISOString(),
        sources: ['poetrydb', 'quotable', 'zenquotes'],
        count: shuffled.length
      })
    };

  } catch (error) {
    console.error('Reservoir stream error:', error);
    
    // Return fallback fragments if APIs fail
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        fragments: getFallbackFragments(),
        generatedAt: new Date().toISOString(),
        sources: ['fallback'],
        count: 10,
        error: 'APIs unavailable, using fallback'
      })
    };
  }
};

// Fetch from PoetryDB
async function fetchPoetry() {
  try {
    const response = await axios.get('https://poetrydb.org/random/3', {
      timeout: 5000
    });
    return response.data;
  } catch (e) {
    console.log('PoetryDB failed:', e.message);
    return null;
  }
}

// Fetch from Quotable
async function fetchQuotes() {
  try {
    const response = await axios.get('https://api.quotable.io/quotes/random?limit=5&maxLength=150', {
      timeout: 5000
    });
    return response.data;
  } catch (e) {
    console.log('Quotable failed:', e.message);
    return null;
  }
}

// Fetch from Zen Quotes
async function fetchZen() {
  try {
    const response = await axios.get('https://zenquotes.io/api/quotes', {
      timeout: 5000
    });
    return response.data;
  } catch (e) {
    console.log('ZenQuotes failed:', e.message);
    return null;
  }
}

// Occasional digital fragment
function getDigitalFragment() {
  const digital = [
    { text: "The stream flows through servers, yet feels like breath.", source: "The Reservoir", category: "digital" },
    { text: "APIs whisper what databases remember.", source: "The Reservoir", category: "digital" },
    { text: "Randomness is just chaos we haven't befriended yet.", source: "The Reservoir", category: "digital" },
    { text: "The cloud is someone else's computer dreaming.", source: "The Reservoir", category: "digital" },
    { text: "Bits align into meaning, if you know how to look.", source: "The Reservoir", category: "digital" }
  ];
  return digital[Math.floor(Math.random() * digital.length)];
}

// Fallback if all APIs fail
function getFallbackFragments() {
  return [
    { text: "I am not I; I am this one walking beside me whom I do not see.", source: "Juan Ramón Jiménez", category: "poetry" },
    { text: "The cave you fear to enter holds the treasure you seek.", source: "Joseph Campbell", category: "myth" },
    { text: "Tell me, what is it you plan to do with your one wild and precious life?", source: "Mary Oliver", category: "poetry" },
    { text: "The eternal silence of these infinite spaces frightens me.", source: "Blaise Pascal", category: "philosophy" },
    { text: "What you seek is seeking you.", source: "Rumi", category: "sacred" },
    { text: "The stream continues, even when the source is hidden.", source: "The Reservoir", category: "digital" }
  ];
}