/*
 *  myPostit.cpp
 *  Created by Laurent Vanni
 *
 */
#include "MyPostit.h"
#include <dirent.h>
#include <iostream>
#include <fstream>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <vector>
#include <sstream>
#include <sys/stat.h>
#include <myMed/ChordNode.h>
#include <myMed/ProtocolSingleton.h>
#include <myMed/http_operations.h>

using namespace std;
using std::ofstream;

void   updatePostit(struct mg_connection *conn, const struct mg_request_info *request_info, void *user_data);
void   newPostit(struct mg_connection *conn, const struct mg_request_info *request_info, void *user_data);
void   unsubscribePostit(struct mg_connection *conn, const struct mg_request_info *request_info, void *user_data);
void   deletePostit(struct mg_connection *conn, const struct mg_request_info *request_info, void *user_data);
void   getPostit(struct mg_connection *conn, const struct mg_request_info *request_info, void *user_data);
void   openPostit(struct mg_connection *conn, const struct mg_request_info *request_info, void *user_data);
void   checkPostitLost(struct mg_connection *conn, const struct mg_request_info *request_info, void *user_data);
void   logout(struct mg_connection *conn, const struct mg_request_info *request_info, void *user_data);
void   shutdown(struct mg_connection *conn, const struct mg_request_info *request_info, void *user_data);

void   savePostit(string filename, string postit);
string openPostit(string filename);
string find_and_replace(string str, const string find, string replace);
string convertToXML(string from, string to, string body, string priority, string time);
string serialize(string postit);
string unserialize(string postit);

/* Default Constructors */
MyPostit::MyPostit(int port) {
	// setup the port number used by mongoose
	this->port = port;
}

/* Launch myPostit application */
void MyPostit::launchMyPostit() {
	// initialize the backbone
	string backBone[] = {  "127.0.0.1" }; // Put here some seeds

	// Create the node node
	ChordNode *node = P_SINGLETON->initChordNode(getLocalIp(), port, OVERLAYID,
			"./WebContent");
	cout << "Create node\t\t\t\t\tok\n";

	// add a callbacks to mongoose for the web user interface
	node->getTransport()->addCallback("/updatePostit", &updatePostit);
	node->getTransport()->addCallback("/newPostit", &newPostit);
	node->getTransport()->addCallback("/unsubscribePostit", &unsubscribePostit);
	node->getTransport()->addCallback("/deletePostit", &deletePostit);
	node->getTransport()->addCallback("/getPostit", &getPostit);
	node->getTransport()->addCallback("/openPostit", &openPostit);
	node->getTransport()->addCallback("/checkPostitLost", &checkPostitLost);
	node->getTransport()->addCallback("/logout", &logout);
	node->getTransport()->addCallback("/shutdown", &shutdown);

	// join to an existing chord
	cout << "Join network\t\t\t\t\t";
	bool joined = false;
	for (int j = 0; j < BACKBONESIZE; j++) {
		//trying to ping the backbone
		Node *chord = new Node(backBone[j], 8000);
		Request *request = new Request(OVERLAYID, GETPRED);
		if (node->transport->sendRequest(request, chord)) {
			node->join(chord);
			joined = true;
			break;
		}
	}

	// console feedback
	(!joined) ? cout << "FAIL!\n" : cout << "ok\n";
	cout << "--------------------------------------------------\n";
	cout << "Done.\n";
}

/* Convert the postit attributes in a XML format */
string convertToXML(string from, string to, string title, string body,
		string priority, string permission, string since, string until) {
	stringstream xml(stringstream::in | stringstream::out);
	xml << "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" <<
			"<posit>\n" <<
			"<from>" << from << "</from>\n" <<
			"<to>" << to << "</to>\n" <<
			"<title>" << title << "</title>\n" <<
			"<body priority=\"" << priority << "\" permission=\""<< permission << "\" since=\"" << since << "\" until=\"" << until <<
			"\">" << body << "</body>\n" <<
			"</posit>\n" << endl;
	return xml.str();
}

/* save an XML postit in a text file */
void savePostit(string filename, string postit){
	char path[256];
	sprintf(path, "WebContent/.postit/%s", filename.c_str());
	postits.push_back(path);
	mkdir("WebContent/.postit", 0755);
	ofstream Postit(path, ios::out);
	Postit << postit;
}

/* return the content of the file */
string openPostit(string filename){
	string line, postit="";
	ifstream myfile(filename.c_str());
	if (myfile.is_open()) {
		while (! myfile.eof()) {
			getline(myfile,line);
			postit.append(line.c_str());
			postit.append("\n");
		}
		myfile.close();
	}
	else cout << "Unable to open file"; 
	return postit;
}

/* tokenize a string with a delimiter of your own choice */
void Tokenize(const string& str, vector<string>& tokens,
		const string& delimiters = " ") {
	// Skip delimiters at beginning.
	string::size_type lastPos = str.find_first_not_of(delimiters, 0);
	// Find first "non-delimiter".
	string::size_type pos = str.find_first_of(delimiters, lastPos);

	while (string::npos != pos || string::npos != lastPos) {
		// Found a token, add it to the vector.
		tokens.push_back(str.substr(lastPos, pos - lastPos));
		// Skip delimiters.  Note the "not_of"
		lastPos = str.find_first_not_of(delimiters, pos);
		// Find next "non-delimiter"
		pos = str.find_first_of(delimiters, lastPos);
	}
}

/* clean the .postit directory or return the content */
string postitDirectoryOperation(bool toClean) {
	string result = "";
	string path = "WebContent/.postit/";
	DIR *pdir = NULL;
	pdir = opendir (path.c_str());
	struct dirent *pent = NULL;
	if (pdir == NULL) return result;

	char file[256];
	int counter = 1; // use this to skip the first TWO which cause an infinite loop (and eventually, stack overflow)
	while (pent = readdir (pdir)) {
		if (counter > 2) {
			for (int i = 0; i < 256; i++) file[i] = '\0';
			strcat(file, path.c_str());
			if (pent == NULL) return result;
			strcat(file, pent->d_name);
			if(strcmp(pent->d_name, "readme")){
				if (toClean) {
					remove(file);
				} else {
					result.append(pent->d_name).append(",");
				}
			}

		} counter++;
	}

	closedir (pdir);
	return result;
}


/* ----------------------------------------------------------------------------- */
/* HANDLE REQUESTS */
void updatePostit(struct mg_connection *conn,
		const struct mg_request_info *request_info, void *user_data) {

	char *from, *to, *title, *body, *priority, *permission, *since, *until, *key;
	string postitXML, keys, postitref, value = "";
	ChordNode *node = P_SINGLETON->getChordNode();
	vector<string> destinations;
	vector<string> postitKeys;

	/* Get the postit attributes */
	assert((from = mg_get_var(conn, "from")) != NULL);
	assert((to = mg_get_var(conn, "to")) != NULL);
	assert((title = mg_get_var(conn, "title")) != NULL);
	assert((body = mg_get_var(conn, "body")) != NULL);
	assert((priority = mg_get_var(conn, "priority")) != NULL);
	assert((permission = mg_get_var(conn, "permission")) != NULL);
	assert((since = mg_get_var(conn, "since")) != NULL);
	assert((until = mg_get_var(conn, "until")) != NULL);
	assert((key = mg_get_var(conn, "key")) != NULL);

	/* Create the postitXML and extract the DHT key/value */
	postitXML = convertToXML(from, to, title, body, priority, permission, since, until);

	/* serialize the value before to store it into the DHT */
	value = node->serialize(postitXML);

	/* Put the postit into the DHT */
	node->put(key, value);

	/* save the postit into a text file */
	savePostit(key, postitXML);
}

void newPostit(struct mg_connection *conn,
		const struct mg_request_info *request_info, void *user_data) {

	char *from, *to, *title, *body, *priority, *permission, *since, *until, *key;
	string postitXML, keys, postitref, value = "";
	ChordNode *node = P_SINGLETON->getChordNode();
	vector<string> destinations;
	vector<string> postitKeys;

	/* Get the postit attributes */
	assert((from = mg_get_var(conn, "from")) != NULL);
	assert((to = mg_get_var(conn, "to")) != NULL);
	assert((title = mg_get_var(conn, "title")) != NULL);
	assert((body = mg_get_var(conn, "body")) != NULL);
	assert((priority = mg_get_var(conn, "priority")) != NULL);
	assert((permission = mg_get_var(conn, "permission")) != NULL);
	assert((since = mg_get_var(conn, "since")) != NULL);
	assert((until = mg_get_var(conn, "until")) != NULL);
	assert((key = mg_get_var(conn, "key")) != NULL);

	/* Create the postitXML and extract the DHT key/value */
	postitXML = convertToXML(from, to, title, body, priority, permission, since, until);

	/* serialize the value before to store it into the DHT */
	value = node->serialize(postitXML);

	/* Put the postit into the DHT */
	node->put(key, value);

	/* save the postit into a text file */
	savePostit(key, postitXML);

	/* notify the destinations */
	Tokenize(to, destinations, ",");
	// Check if the postit's destination is for all users
	for (int i = 0; i < destinations.size(); i++) {
		if(!strcmp(destinations[i].c_str(), "allusers")){
			destinations.clear();
			Tokenize(node->get("mypostitUsers"), destinations, ",");
			break;
		}
	}
	for (int i = 0; i < destinations.size(); i++) {
		if(strcmp(destinations[i].c_str(), "")){
			/* add a pointer for the postit */
			if (i != 0) {
				postitref.append(",");
			}
			postitref.append(destinations[i]);

			/* notify the user/destination */
			if ((keys = node->get(destinations[i].append("Postit"))) == "null") {
				node->put(destinations[i], key);
			} else {
				keys.append(",");
				node->put(destinations[i], keys.append(key));
			}
		}
	}
	/* create the postit's references */
	node->put(string(key).append("REF"), postitref);
}

void unsubscribePostit(struct mg_connection *conn,
		const struct mg_request_info *request_info, void *user_data) {

	char *from, *key;
	string postitref, value = "";
	ChordNode *node = P_SINGLETON->getChordNode();
	vector<string> destinations;
	vector<string> postitKeys;

	/* Get the postit key to delete */
	assert((key = mg_get_var(conn, "key")) != NULL);
	assert((from = mg_get_var(conn, "from")) != NULL);

	/* update the postit references */
	Tokenize(node->get(string(key).append("REF")), destinations, ",");
	for (int i = 0; i < destinations.size(); i++) {
		if(strcmp(destinations[i].c_str(), from)){
			if(postitref != ""){
				postitref.append(",");
			}
			postitref.append(destinations[i]);
		}
	}
	if(strcmp(postitref.c_str(), "")){
		node->put(string(key).append("REF"), postitref);
	} else {
		// no more references on this postit
		// delete it!
		node->removekey(string(key).append("REF")); // remove postitREF
		node->removekey(key); // remove postit
	}

	/* update the user references */
	Tokenize(node->get(string(from).append("Postit")), postitKeys, ",");
	for (int i = 0; i < postitKeys.size(); i++) {
		if(strcmp(postitKeys[i].c_str(), key)){
			if(value != ""){
				value.append(",");
			}
			value.append(postitKeys[i]);
		}
	}
	if(strcmp(value.c_str(), "")){
		node->put(string(from).append("Postit"), value);
	} else {
		node->removekey(string(from).append("Postit"));
	}
}

void deletePostit(struct mg_connection *conn,
		const struct mg_request_info *request_info, void *user_data) {
	char *from, *key;
	string postitref, value = "";
	ChordNode *node = P_SINGLETON->getChordNode();
	vector<string> destinations;
	vector<string> postitKeys;

	/* Get the postit key to delete */
	assert((key = mg_get_var(conn, "key")) != NULL);

	/* delete the postit */
	node->removekey(string(key));

	/* delete all the users reference */
	Tokenize(node->get(string(key).append("REF")), destinations, ",");
	for (int i = 0; i < destinations.size(); i++) {
		Tokenize(node->get(destinations[i].append("Postit")), postitKeys, ",");
		for (int j = 0; j < postitKeys.size(); j++) {
			if(strcmp(postitKeys[j].c_str(), key)){
				if(value != ""){
					value.append(",");
				}
				value.append(postitKeys[j]);
			}
		}
		if(strcmp(value.c_str(), "")){
			node->put(destinations[i], value);
		} else {
			node->removekey(destinations[i]);
		}
		postitKeys.clear();
		value = "";
	}

	/* delete the postitREF */
	node->removekey(string(key).append("REF"));
}

void getPostit(struct mg_connection *conn,
		const struct mg_request_info *request_info, void *user_data) {
	/* Get the postit key */
	char *key;
	string value;
	ChordNode *node = P_SINGLETON->getChordNode();
	assert((key = mg_get_var(conn, "key")) != NULL);
	value = node->get(key);
	mg_printf(conn, value.c_str());
}

void openPostit(struct mg_connection *conn,
		const struct mg_request_info *request_info, void *user_data) {
	/* Get the postit key */
	char *key;
	assert((key = mg_get_var(conn, "path")) != NULL);
	string value = openPostit(key).c_str();
	mg_printf(conn, value.c_str());
}

void checkPostitLost(struct mg_connection *conn,
		const struct mg_request_info *request_info, void *user_data) {
	string keys = postitDirectoryOperation(false);
	mg_printf(conn, keys.c_str());
}

void logout(struct mg_connection *conn,
		const struct mg_request_info *request_info, void *user_data) {
	postitDirectoryOperation(true);
}

void shutdown(struct mg_connection *conn,
		const struct mg_request_info *request_info, void *user_data) {
	postitDirectoryOperation(true);
	ChordNode *node = P_SINGLETON->getChordNode();
	node->shutDown();
}

/* ----------------------------------------------------------------------------- */

/* Start the application */
int main(int argc, char * const argv[]) {
	/* intitialize the default port used by mongoose */
	int port = DEFAULTPORT;

	/* initalization of the command line arguments */
	for (int i = 0; i < argc; i++) {
		if (!strcmp(argv[i], "-v") || !strcmp(argv[i], "--version")) {
			cout << "mypostit version 1.1\n";
			return 0;
		} else if (!strcmp(argv[i], "-h") || !strcmp(argv[i], "--help")) {
			cout
			<< "Usage: myPostit [-v|--version] [-p|--port <PORTNUMBER>] [-h|--help]\n";
			return 0;
		} else if (!strcmp(argv[i], "-p") || !strcmp(argv[i], "--port")) {
			if (argv[i + 1] == 0 || (port = atoi(argv[i + 1])) == 0) {
				cout << "bad arguments!\n";
				cout
				<< "Usage: myPostit [-v|--version] [-p|--port <PORTNUMBER>] [-h|--help]\n";
				return 0;
			}
		}
	}

	/* Create myPostit */
	MyPostit *myPostit = new MyPostit(port);
	/* Launch myPostit */
	myPostit->launchMyPostit();

	/* Stand-By */
	while (1) {
		usleep(20000);
	}
	return 0;
}
