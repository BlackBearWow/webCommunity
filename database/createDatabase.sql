drop database if exists jsgame;
create database jsgame;
use jsgame;
drop table if exists account;
create table account(
	userId varchar(40) not null,
	passwd varchar(70) not null,
	nickname varchar(40) not null,
	charImg varchar(40) not null,
	level int DEFAULT 1,
	exp int DEFAULT 1,
	speed float DEFAULT 1.2,
	wbLimitQuantity int DEFAULT 1,
	wbLen int DEFAULT 1,
	money int DEFAULT 0,
	primary key(userId)
)default charset=utf8;
drop table if exists post;
create table post(
	bId int not null auto_increment,
	title varchar(100) not null,
	text varchar(1000) not null,
	postDatetime datetime not null,
	commentNum int default 0,
	userId varchar(40) not null,
	nickname varchar(40) not null,
	primary key(bId)
)default charset=utf8;
drop table if exists comment;
create table comment(
	cId int not null auto_increment,
	bId int not null,
	cText varchar(400),
	commentDatetime datetime not null,
	userId varchar(40) not null,
	nickname varchar(40) not null,
	primary key(cId)
)default charset=utf8;