import { serve } from "https://deno.land/std@0.173.0/http/server.ts";
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const dbPool = new Pool(
  {
    hostname: "postgres",
    database: "root",
    user: "root",
    password: "root",
  },
  100,
  true
);

await createTable(dbPool);

async function handler(req: Request): Promise<Response> {
  const db = await dbPool.connect();

  try {
    if (req.method === "GET") {
      const {
        rows: [{ user_count }],
      } = await db.queryObject("select COUNT(*) as user_count from users");
      const { rows: users } = await db.queryObject(
        `select * from users limit 50 OFFSET ${Math.floor(
          Math.random() * (Number(user_count) - 50)
        )}`
      );
      return new Response(JSON.stringify(users));
    }

    const userInput = await req.json();

    const newUser = new UserModel(
      userInput.name,
      userInput.userName,
      userInput.email,
      userInput.bio,
      userInput.birthDate,
      userInput.gender,
      userInput.avatar,
      userInput.header,
      userInput.password
    );
    await newUser.save();

    return new Response(JSON.stringify(userInput));
  } finally {
    db.release();
  }
}

serve(handler, { port: 5000 });

async function createTable(dbPool) {
  const db = await dbPool.connect();

  try {
    await db.queryObject(
      `create table IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name varchar(255),
        userName varchar(255),
        email varchar(255),
        bio varchar(255),
        birthDate varchar(255),
        gender varchar(255),
        avatar varchar(255),
        header varchar(255),
        password varchar(255)
        )`
    );
  } finally {
    db.release();
  }
}

class UserModel {
  // TODO:
  private db = dbPool.connect();

  constructor(
    public name: string,
    public userName: string,
    public email: string,
    public bio: string,
    public birthDate: string,
    public gender: string,
    public avatar: string,
    public header: string,
    public password: string
  ) {}

  async save() {
    // TODO:
    return this.db
      .queryObject(
        `insert into users(name, userName, email, bio, birthDate, gender, avatar, header, password)
    values(
        '${this.name}',
        '${this.userName}',
        '${this.email}',
        '${this.bio}',
        '${this.birthDate}',
        '${this.gender}',
        '${this.avatar}',
        '${this.header}',
        '${this.password}'
        )`
      )
      .finally(() => this.db.release());
  }
}
