#include <wchar.h>
#include "emscripten.h"

#ifdef __has_feature
#if __has_feature(address_sanitizer)
#include <sanitizer/lsan_interface.h>
#endif
#endif

typedef wchar_t QSP_CHAR;
typedef int (*QSP_CALLBACK)();

#define QSP_BINDING
#ifndef _UNICODE
#define _UNICODE
#endif

#include "qsp/declarations.h"
#include "qsp/bindings/default/qsp_default.h"

#include "qsp/callbacks.h"
#include "qsp/common.h"
#include "qsp/game.h"
#include "qsp/locations.h"
#include "qsp/actions.h"
#include "qsp/objects.h"
#include "qsp/text.h"
#include "qsp/time.h"
#include "qsp/coding.h"
#include "qsp/statements.h"
#include "qsp/mathops.h"
#include "qsp/variables.h"
#include "qsp/errors.h"

EMSCRIPTEN_KEEPALIVE
const char *__asan_default_options() {
  return "detect_stack_use_after_return=1:print_stats=1";
}

int MAX_LIST_ITEMS = 1000;

QSP_CALLBACK errorCallback;

EMSCRIPTEN_KEEPALIVE
void init()
{
  QSPInit();
}

EMSCRIPTEN_KEEPALIVE
void dispose()
{
  QSPDeInit();
}

EMSCRIPTEN_KEEPALIVE
void getVersion(QSPString *result)
{
  *result = QSPGetVersion();
}

EMSCRIPTEN_KEEPALIVE
void setErrorCallback(QSP_CALLBACK func)
{
  errorCallback = func;
}

void onError()
{
  if (errorCallback)
  {
    errorCallback();
  }
}

/* Main desc */
EMSCRIPTEN_KEEPALIVE
void getMainDesc(QSPString *result)
{
  *result = QSPGetMainDesc();
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL isMainDescChanged()
{
  return QSPIsMainDescChanged();
}

/* Vars desc */
EMSCRIPTEN_KEEPALIVE
void getVarsDesc(QSPString *result)
{
  *result = QSPGetVarsDesc();
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL isVarsDescChanged()
{
  return QSPIsVarsDescChanged();
}

/* Actions */
EMSCRIPTEN_KEEPALIVE
QSPListItem *getActions(int *count)
{
  *count = qspCurActionsCount;
  QSPListItem *items = (QSPListItem *)malloc(qspCurActionsCount * sizeof(QSPListItem));
  int i;
  for (i = 0; i < qspCurActionsCount; ++i)
  {
    items[i].Name = qspCurActions[i].Desc;
    items[i].Image = qspCurActions[i].Image;
  }
  return items;
}

EMSCRIPTEN_KEEPALIVE
void selectAction(int index)
{
  if (!QSPSetSelActionIndex(index, QSP_TRUE))
  {
    onError();
  }
}

EMSCRIPTEN_KEEPALIVE
void executeSelAction()
{
  if (!QSPExecuteSelActionCode(QSP_TRUE))
    onError();
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL isActionsChanged()
{
  return QSPIsActionsChanged();
}

/* Objects */
EMSCRIPTEN_KEEPALIVE
QSPListItem *getObjects(int *count)
{
  *count = qspCurObjectsCount;
  int i;
  QSPListItem *items = (QSPListItem *)malloc(qspCurObjectsCount * sizeof(QSPListItem));
  for (i = 0; i < qspCurObjectsCount; ++i)
  {
    items[i].Name = qspCurObjects[i].Desc;
    items[i].Image = qspCurObjects[i].Image;
  }
  return items;
}

EMSCRIPTEN_KEEPALIVE
void selectObject(int index)
{
  if (!QSPSetSelObjectIndex(index, QSP_TRUE))
  {
    onError();
  }
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL isObjectsChanged()
{
  return QSPIsObjectsChanged();
}

/* Game */
EMSCRIPTEN_KEEPALIVE
void loadGameData(const void *data, int dataSize, QSP_BOOL isNewGame)
{
  if (!QSPLoadGameWorldFromData(data, dataSize, isNewGame))
  {
    onError();
  }
}

EMSCRIPTEN_KEEPALIVE
void restartGame()
{
  if (!QSPRestartGame(QSP_TRUE))
  {
    onError();
  }
}

EMSCRIPTEN_KEEPALIVE
void *saveGameData(int *realSize)
{
  *realSize = 0;
  int fileSize = 64 * 1024;
  void *fileData = (void *)malloc(fileSize);
  if (!QSPSaveGameAsData(fileData, &fileSize, QSP_FALSE))
  {
    while (fileSize)
    {
      fileData = (void *)realloc(fileData, fileSize);
      if (QSPSaveGameAsData(fileData, &fileSize, QSP_TRUE))
        break;
    }
    if (!fileSize)
    {
      free(fileData);
      return fileData;
    }
  }

  *realSize = fileSize;
  return fileData;
}

EMSCRIPTEN_KEEPALIVE
void loadSavedGameData(const void *data, int dataSize)
{
  if (!QSPOpenSavedGameFromData(data, dataSize, QSP_TRUE))
  {
    onError();
  }
}

/* exec code */
EMSCRIPTEN_KEEPALIVE
void execString(QSP_CHAR *s, QSP_BOOL isRefresh)
{
  if (!QSPExecString(qspStringFromC(s), isRefresh))
  {
    onError();
  }
}

EMSCRIPTEN_KEEPALIVE
void execExpression(QSP_CHAR *s)
{
  QSPLineOfCode *strs;
  int linesCount = qspPreprocessData(qspStringFromC(s), &strs);
  qspExecCode(strs, 0, linesCount, 0, 0);
  qspFreePrepLines(strs, linesCount);
}

EMSCRIPTEN_KEEPALIVE
void execCounter()
{
  if (!QSPExecCounter(QSP_TRUE))
  {
    onError();
  }
}

EMSCRIPTEN_KEEPALIVE
void execLoc(QSP_CHAR *name)
{
  if (!QSPExecLocationCode(qspStringFromC(name), QSP_TRUE))
  {
    onError();
  }
}

EMSCRIPTEN_KEEPALIVE
void execUserInput(QSP_CHAR *s)
{
  QSPSetInputStrText(qspStringFromC(s));

  if (!QSPExecUserInput(QSP_TRUE))
  {
    onError();
  }
}

/* Errors */
EMSCRIPTEN_KEEPALIVE
int getLastErrorNum()
{
  return qspErrorNum;
}

EMSCRIPTEN_KEEPALIVE
void getLastErrorLoc(QSPString *errorLoc)
{
  *errorLoc = (qspErrorLoc >= 0 && qspErrorLoc < qspLocsCount ? qspLocs[qspErrorLoc].Name : qspNullString);
}

EMSCRIPTEN_KEEPALIVE
int getLastErrorActIndex()
{
  return qspErrorActIndex;
}

EMSCRIPTEN_KEEPALIVE
int getLastErrorLine()
{
  return qspErrorLine;
}

EMSCRIPTEN_KEEPALIVE
QSPString getErrorDesc(int errorNum)
{
  return QSPGetErrorDesc(errorNum);
}

EMSCRIPTEN_KEEPALIVE
void getVarStringValue(QSP_CHAR *name, int ind, QSPString *strVal)
{
  int numVal;

  if (!QSPGetVarValues(qspStringFromC(name), ind, &numVal, strVal))
  {
    *strVal = qspNullString;
  }
}

EMSCRIPTEN_KEEPALIVE
int getVarNumValue(QSP_CHAR *name, int ind)
{
  QSPString strVal;
  int numVal = 0;

  if (QSPGetVarValues(qspStringFromC(name), ind, &numVal, &strVal))
  {
    return numVal;
  }
  return 0;
}

EMSCRIPTEN_KEEPALIVE
void getVarStringValueByKey(QSP_CHAR *name, QSP_CHAR *key, QSPString *strVal)
{
  QSPString varName = qspStringFromC(name);
  QSPVar *var;
  var = qspVarReference(varName, QSP_FALSE);
  if (!var)
  {
    *strVal = qspNullString;
    return;
  }
  int ind = qspGetVarTextIndex(var, qspStringFromC(key), QSP_FALSE);
  int numVal;

  if (!QSPGetVarValues(varName, ind, &numVal, strVal))
  {
    *strVal = qspNullString;
  }
}

EMSCRIPTEN_KEEPALIVE
int getVarNumValueByKey(QSP_CHAR *name, QSP_CHAR *key)
{
  QSPString varName = qspStringFromC(name);
  QSPVar *var;
  var = qspVarReference(varName, QSP_FALSE);
  if (!var)
  {
    return 0;
  }
  int ind = qspGetVarTextIndex(var, qspStringFromC(key), QSP_FALSE);
  QSPString strVal;
  int numVal = 0;

  if (QSPGetVarValues(varName, ind, &numVal, &strVal))
  {
    return numVal;
  }
  return 0;
}

EMSCRIPTEN_KEEPALIVE
int getVarSize(QSP_CHAR *name)
{
  int numVal = 0;
  QSPGetVarValuesCount(qspStringFromC(name), &numVal);
  return numVal;
}

/* callbacks */
EMSCRIPTEN_KEEPALIVE
void initCallBacks()
{
  qspInitCallBacks();
}

EMSCRIPTEN_KEEPALIVE
void setCallBack(int type, QSP_CALLBACK func)
{
  qspSetCallBack(type, func);
}

/* Struct utils */
EMSCRIPTEN_KEEPALIVE
void freeItemsList(QSPListItem *items)
{
  free(items);
}

EMSCRIPTEN_KEEPALIVE
void freeSaveBuffer(void *buffer)
{
  free(buffer);
}

EMSCRIPTEN_KEEPALIVE
void freeStringsBuffer(QSPString *list)
{
  free(list);
}

/* debug */
EMSCRIPTEN_KEEPALIVE
void enableDebugMode()
{
  QSPEnableDebugMode(QSP_TRUE);
}

EMSCRIPTEN_KEEPALIVE
void disableDebugMode()
{
  QSPEnableDebugMode(QSP_FALSE);
}

EMSCRIPTEN_KEEPALIVE
void getCurStateLoc(QSPString *loc)
{
  *loc = (qspRealCurLoc >= 0 && qspRealCurLoc < qspLocsCount ? qspLocs[qspRealCurLoc].Name : qspNullString);
}

EMSCRIPTEN_KEEPALIVE
int getCurStateLine()
{
  return qspRealLine;
}

EMSCRIPTEN_KEEPALIVE
int getCurStateActIndex()
{
  return qspRealActIndex;
}

EMSCRIPTEN_KEEPALIVE
QSPString *getLocationsList(int *count)
{
  *count = qspLocsCount;
  QSPString *lines = (QSPString *)malloc(qspLocsCount * sizeof(QSPString));
  int i;
  for (i = 0; i < qspLocsCount; ++i)
  {
    lines[i] = qspLocs[i].Name;
  }
  return lines;
}

EMSCRIPTEN_KEEPALIVE
QSPString *getLocationCode(QSP_CHAR *name, int *count)
{
  int locInd = qspLocIndex(qspStringFromC(name));
  if (locInd >= 0)
  {
    QSPLocation *loc = qspLocs + locInd;

    *count = loc->OnVisitLinesCount;
    QSPString *lines = (QSPString *)malloc(loc->OnVisitLinesCount * sizeof(QSPString));
    int i;
    for (i = 0; i < loc->OnVisitLinesCount; ++i)
    {
      lines[i] = loc->OnVisitLines[i].Str;
    }
    return lines;
  }
}

EMSCRIPTEN_KEEPALIVE
QSPString *getActionCode(QSP_CHAR *name, int index, int *count)
{
  int locInd = qspLocIndex(qspStringFromC(name));

  if (locInd >= 0 && index >= 0 && index < QSP_MAXACTIONS)
  {
    QSPLocation *loc = qspLocs + locInd;
    QSPLocAct *act = loc->Actions + index;
    *count = act->OnPressLinesCount;
    QSPString *lines = (QSPString *)malloc(act->OnPressLinesCount * sizeof(QSPString));
    int i;
    for (i = 0; i < act->OnPressLinesCount; ++i)
    {
      lines[i] = act->OnPressLines[i].Str;
    }
    return lines;
  }
}

EMSCRIPTEN_KEEPALIVE
void _run_checks()
{
#if defined(__has_feature)
#if __has_feature(address_sanitizer)
  // code for ASan-enabled builds
  __lsan_do_leak_check();
#endif
#endif
}