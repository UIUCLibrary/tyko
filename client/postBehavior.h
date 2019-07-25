//
// Created by Borchers, Henry Samuel on 2019-06-28.
//

#ifndef AVDATABASEEDITOR_POSTBEHAVIOR_H
#define AVDATABASEEDITOR_POSTBEHAVIOR_H


#include "projectadder.h"
#include <string>
class PostBehavior {
public:
    virtual ~PostBehavior() {};
    virtual long send(const std::string &url, std::string &response_text, const std::map<std::string, QString> &form_data) = 0;
};


#endif //AVDATABASEEDITOR_POSTBEHAVIOR_H
