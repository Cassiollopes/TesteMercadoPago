import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const formNull = {
    amount: '',
    description: '',
    email: '',
    cpf: '',
  };

  const [form, setForm] = useState(formNull);
  const [link, setLink] = useState('');

  const submit = (e) => {
    e.preventDefault();
    axios
      .post('http://157.230.81.1:8000/payment', { ...form })
      .then((response) => {
        console.log(response.data);
        setLink(response.data.point_of_interaction.transaction_data.ticket_url);
        setForm(formNull);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div>
      <form
        onSubmit={submit}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <input
          type="number"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          placeholder="Preco"
        />
        <input
          type="text"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Descricao"
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
        />
        <input
          type="number"
          name="cpf"
          value={form.cpf}
          onChange={(e) => setForm({ ...form, cpf: e.target.value })}
          placeholder="Cpf"
        />
        <button>Create Payment</button>
      </form>
      {link && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '440px',
            height: '820px',
            background: '#222',
            padding: '1rem'
          }}
        >
          <iframe src={link} style={{width: '100%', height: '100%'}}></iframe>
        </div>
      )}
    </div>
  );
};

export default App;
