const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const fetch = require('node-fetch');

const app = express();



// Define the GraphQL schema
const schema = buildSchema(`
  type Query {
    getFlights: [String]
  }
  type Mutation {
    searchFlight(from: String, to: String, adults: Int, children: Int, travelClass: String, departureDate: String, journeyType: String): String
  }
`);

// Define the resolver functions
const root = {
  getFlights: () => {
    return ['Singapore', 'Australia', 'USA', 'UK'];
  },
  searchFlight: ({ from, to, adults, children, travelClass, departureDate, journeyType }) => {
    return `Searching flights from ${from} to ${to} for ${adults} adults and ${children} children. Travel Class: ${travelClass}, Departure Date: ${departureDate}, Journey Type: ${journeyType}`;
  }
};

// Setup GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.set('view engine', 'ejs');
app.use(express.static('public')); // This will serve static files from the "public" folder
app.use(express.urlencoded({ extended: true })); // To parse form data


// Render the EJS form on GET request
app.get('/', (req, res) => {
  res.render('index'); // Looks for views/index.ejs
});

// Handle form submission and send data to the GraphQL endpoint
app.post('/search', (req, res) => {
  const { from, to, adults, children, travelClass, departureDate, journeyType } = req.body;
  
  // Construct the GraphQL mutation query
  const query = `
    mutation {
      searchFlight(from: "${from}", to: "${to}", adults: ${adults}, children: ${children}, travelClass: "${travelClass}", departureDate: "${departureDate}", journeyType: "${journeyType}")
    }
  `;

  // Send the query to the GraphQL server
  fetch("https://my-app.vercel.app/graphql", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  })
    .then(response => response.json())
    .then(data => {
      // You can render a new EJS template for the result or send back plain HTML
      res.send(`<h2>${data.data.searchFlight}</h2>`);
    })
    .catch(error => {
      res.send('Error: ' + error);
    });
});


  

// Listen on port 3000
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
