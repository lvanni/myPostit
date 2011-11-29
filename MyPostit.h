/*
 *  myPostit.h
 *  Created by Laurent Vanni
 *
 */
#ifndef MYPOSTIT_H
#define MYPOSTIT_H

#include <myMed/IRequestHandler.h>
#include <list>

#define OVERLAYID 	 "chordTestBed"
#define DEFAULTPORT  8000
#define BACKBONESIZE 1

/* REQUEST CODE */
#define NEWPOSTIT		1
#define GETPOSTIT		2
#define UPDATEPOSTIT	3
#define DELETEPOSTIT	4

#define SAVEPOSTIT		11
#define IMPORTPOSTIT	12
#define EXPORTPOSTIT	13
#define OPENPOSTIT		14

#define SHUTDOWN		21
#define LOGOUT			22

#define CHECKPOSTITLOST 31


using namespace std;

/* postit saved */
list<string> postits;

class MyPostit: public IRequestHandler {

public:
	/* default constructor */
	MyPostit(int port);
	~MyPostit();

	/* handle a request from the user interface */
	void launchMyPostit();

private:
	/* port used by mongoose */
	int port;
};

#endif
