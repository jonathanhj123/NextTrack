import { connect } from "./connect.js";
import pg from "pg";
import upload from "pg-upload";

const db = await connect();
const timestamp = (await db.query("select now() as timestamp")).rows[0][
  "timestamp"
];
console.log(`Recreating database on ${timestamp}...`);

//Drop alle gamle tables ved opstart
await db.query("drop table if exists transfers");
await db.query("drop table if exists address");
await db.query("drop table if exists pricepoints");
await db.query("drop table if exists currency");
await db.query("drop table if exists transaction");
await db.query("drop table if exists block");

//lav block table
await db.query(` 
    create table block (
        block_id  integer unique not null,
        date  text  not null,
        block_hash text  not null
    )
`);
//importere csv data ind i SQL server
await upload(
  db,
  "db/block.csv",
  `
    copy block (block_id, block_hash, date)
    from stdin
    with csv header encoding 'utf-8'
`,
);

//Lav transaction table
await db.query(`
    create table transaction (
        block_id  integer references block (block_id),
        transaction_id   integer unique not null,
        transactions_hash    text not null
    )
`);
await upload(
  db,
  "db/transaction.csv",
  `
    copy transaction (transaction_id, transactions_hash, block_id)
    from stdin
    with csv header encoding 'utf-8'
`,
);

//Lav currency table
await db.query(`
    create table currency (
        name    text not null,
        currency_id    integer unique not null,
        symbol text not null
    )   
`);
//bigint = 64 bit heltal
//numeric = 10 cifre før decimalkomma og 2 efter
await upload(
  db,
  "db/currency.csv",
  `
    copy currency (currency_id, name,symbol)
    from stdin
    with csv header encoding 'utf-8'
`,
);

//Lav address table
await db.query(`
    create table address (
        address_id    integer unique not null,
        address_name    text not null
    )   
`);
await upload(
  db,
  "db/address.csv",
  `
    copy address (address_id, address_name)
    from stdin
    with csv header encoding 'utf-8'
`,
);

//pricepoints table
await db.query(`
    create table pricepoints (
        timestamp text not null,
        usd_price integer not null,
        currency_id integer not null references currency (currency_id)
    )
`);

await upload(
  db,
  "db/pricepoints.csv",
  `
    copy pricepoints (timestamp, currency_id, usd_price)
    from stdin
    with csv header encoding 'utf-8'
`,
);

//Lav transfers table
await db.query(`
    create table transfers (
        sender_address_id integer not null references address (address_id),
        receiver_address_id integer not null references address (address_id),
        transaction_id  integer not null,
        currency_id   integer not null,
        amount integer not null
    )
`);
//real = float (32bit floating)
await upload(
  db,
  "db/transfers.csv",
  `
    copy transfers (transaction_id,sender_address_id, receiver_address_id, amount , currency_id)
    from stdin
    with csv header encoding 'utf-8'
`,
);

await db.end();
console.log("Database successfully recreated.");
