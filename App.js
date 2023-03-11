import { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import * as SQLite from 'expo-sqlite';

export default function App() {
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [list, setList] = useState([]);

  const fail = () => {
    alert('Something went wrong!');
  }

  const updateList = () => {
    db.transaction(tx => {
      tx.executeSql('select * from product;', [], (_, { rows }) =>
        setList(rows._array)
      );
    }, fail, null);
    setProduct('');
    setAmount('');
  }

  const clearAll = () => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM product; ');
    }, fail, updateList);
  }

  const db = SQLite.openDatabase('product.db');

  const saveItem = () => {
    if (product === '') {
      alert('Type in product first');
    } else if (amount === '') {
      alert('Type in amount first');
    } else {
      db.transaction(tx => {
        tx.executeSql('insert into product (title, amount) values (?, ?);',
          [product, amount]);
      }, fail, updateList);
    }
  }

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('create table if not exists product (id integer primary key not null, title text, amount text); ');
    }, fail, updateList);
  }, []);

  const deleteItem = (id) => {
    db.transaction(
      tx => { tx.executeSql('delete from product where id = ?;', [id]); }, fail, updateList
    );
  }


  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textfield}
        onChangeText={currValue => setProduct(currValue)}
        value={product}
        placeholder='Product'
      />
      <TextInput
        style={styles.textfield}
        onChangeText={currValue => setAmount(currValue)}
        value={amount}
        placeholder='Amount'
      />
      <View style={{ flexDirection: 'row' }}>
        <Button onPress={saveItem} title='Add' />
        <Button onPress={clearAll} title='Clear' />
      </View>
      {list.length > 0 && <Text style={styles.header}>Shopping List:</Text>}
      <FlatList
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) =>
          <View style={styles.listcontainer}>
            <Text>{item.title}, {item.amount} </Text>
            <Text style={{ color: '#0000ff' }} onPress={() => deleteItem(item.id)}>Bought</Text>
          </View>
        }
        data={list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 80,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textfield:
  {
    height: 30,
    width: 200,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
  },
  header: {
    color: 'blue',
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 5
  },
  listcontainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  }
});
