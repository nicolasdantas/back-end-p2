const connection = require('./config');
const express = require('express');
const cors = require('cors');
port = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.use(cors());

connection.connect(function (err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});

app.get('/', (request, response) => {
  response.send('Welcome on Où est Covid Store');
});

app.get('/api/products', (request, res) => {
  connection.query('SELECT * from products', (err, results) => {
    if (err) {
      res.status(404).send('Error retrieving data');
    } else {
      res.status(200).json(results);
    }
  });
});

app.get('/api/basket', (request, res) => {
  connection.query('SELECT * from basket', (err, results) => {
    if (err) {
      res.status(404).send('Error retrieving data');
    } else {
      res.status(200).json(results);
    }
  });
});

app.post('/api/basket', (req, res) => {
  const {
    description,
    id,
    main_img,
    marque,
    price,
    product,
    quantity,
    stock,
  } = req.body;
  connection.query(
    'INSERT INTO basket(id, product, description, price, quantity, marque, main_img, stock) VALUES(?, ?, ?, ?, ?, ?, ?, ?)',
    [id, product, description, price, quantity, marque, main_img, stock],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(400).send('Error saving a product in basket');
      } else {
        res.status(201).send(req.body);
      }
    }
  );
});

app.put('/api/basket/:id', (req, res) => {
  const idProduct = req.params.id;
  const newQuantity = req.body;
  connection.query(
    'UPDATE basket SET ? WHERE id = ?',
    [newQuantity, idProduct],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(400).send('Error updating quantity in basket');
      } else {
        res.status(202).send(req.body);
      }
    }
  );
});

app.put('/api/products/', (req, res) => {
  req.body.map(
    (item) => {
      let idProduct = item.id;
      let newQuantity = item.quantity;
      connection.query('UPDATE products SET stock=stock-? WHERE id = ?', [
        newQuantity,
        idProduct,
      ]);
    },
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(400).send('Error updating quantity in stock');
      } else {
        res.status(202).sens(req.body);
      }
    }
  );
});

app.delete('/api/basket/:id', (req, res) => {
  const idProduct = req.params.id;
  connection.query(
    'DELETE FROM basket WHERE id = ?',
    [idProduct],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(400).send('Error deleting product in basket');
      } else {
        res.sendStatus(204);
      }
    }
  );
});

app.delete('/api/basket', (req, res) => {
  connection.query('TRUNCATE TABLE basket', (err, results) => {
    if (err) {
      console.log(err);
      res.status(400).send('Error truncating basket');
    } else {
      res.sendStatus(204);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
