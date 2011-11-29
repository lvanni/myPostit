CC = /usr/bin/g++
CC_OPTIONS = -I.


#if we passed ARCH=osx
ifeq ($(ARCH),osx)
	@echo Building for OSX ( ARCH=osx )
	CC_OPTIONS = -DOSX=1
endif

#if we passed ARCH=linux
ifeq ($(ARCH),linux)
	@echo Building for LINUX ( ARCH=linux )
	LNK_OPTIONS = -lpthread -lrt -ldl
endif

all: myPostit
	
myPostit: MyPostit.cpp MyPostit.h
	$(CC) $(CCFLAGS) $(LNK_OPTIONS) MyPostit.cpp lib/cChord/src/libmymed.a -o myPostit


clean:
	rm -f myPostit