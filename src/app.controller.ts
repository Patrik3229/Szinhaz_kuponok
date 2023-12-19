import { Body, Controller, Get, Post, Render, Res } from '@nestjs/common';
import * as mysql from 'mysql2';
import { AppService } from './app.service';
import { Coupon } from './Coupon';
import e, { Response } from 'express';

const conn = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'database',
}).promise();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  async index() {
    const [adatok] = await conn.execute('select id, title, percentage, code FROM kuponok');
    return {message: 'Welcome to the homepage', title: 'Current coupons', kuponok: adatok };
  }

  @Get('/newCoupon')
  @Render('newCoupon')
  gyerekek() {
    return { title: 'Add a new Coupon', error: '' };
  }
  @Post('/newCoupon')
  @Render('index')
  async ujGyerek(@Body() coupon: Coupon, @Res() res: Response) {
    const title = coupon.title;
    const percentage = coupon.percentage;
    const code = coupon.code;
    if (title.length > 0 && percentage > 0 && percentage < 100 && code.length == 11 && code.match(/([A-Z]{4}-[0-9]{6})/g) != null) {
      const [ adatok ] = await conn.execute(
        'INSERT INTO kuponok (title, percentage, code) VALUES (?, ?, ?)',
        [title, percentage, code],
      );
  
      console.log(adatok);
      res.redirect('/');
    }
    else {
      console.log("-------------");
      
      console.log(title.length > 0);
      console.log(percentage > 0);
      console.log(percentage < 100);
      console.log(code.length == 11);
      console.log(code.match(/([A-Z]{4}-[0-9]{6})/g) != null);
      
      return { error: 'Something is not good with the data input.' };
    }
  }
}
