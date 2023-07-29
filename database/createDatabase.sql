drop database if exists jsgame;
create database jsgame;

use jsgame;

drop table if exists account;
create table account(
	id varchar(40) not null,
	passwd varchar(70) not null,
	nickname varchar(40) not null,
	level int DEFAULT 1,
	exp int DEFAULT 1,
	speed float DEFAULT 1.2,
	wbLimitQuantity int DEFAULT 1,
	wbLen int DEFAULT 1,
	money int DEFAULT 0,
	primary key(id)
)default charset=utf8;