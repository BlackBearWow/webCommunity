drop database if exists jsgame;
create database jsgame;
use jsgame;
drop table if exists account;
create table account(
	userId varchar(40) not null,
	passwd varchar(70) not null,
	nickname varchar(40) not null,
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
	title varchar(50) not null,
	text varchar(500) not null,
	postDatetime datetime not null,
	commentNum int default 0,
	primary key(bId)
)default charset=utf8;