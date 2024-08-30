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

#include "qsp/bindings/default/qsp_default.h"

EMSCRIPTEN_KEEPALIVE
const char *__asan_default_options()
{
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
  QSPTerminate();
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
  QSPListItem *items = (QSPListItem *)malloc(MAX_LIST_ITEMS * sizeof(QSPListItem));
  *count = QSPGetActions(items, MAX_LIST_ITEMS);
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
  QSPListItem *items = (QSPListItem *)malloc(MAX_LIST_ITEMS * sizeof(QSPListItem));
  *count = QSPGetObjects(items, MAX_LIST_ITEMS);
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
  if (!QSPExecString(QSPStringFromC(s), isRefresh))
  {
    onError();
  }
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
  if (!QSPExecLocationCode(QSPStringFromC(name), QSP_TRUE))
  {
    onError();
  }
}

EMSCRIPTEN_KEEPALIVE
void execUserInput(QSP_CHAR *s)
{
  QSPSetInputStrText(QSPStringFromC(s));

  if (!QSPExecUserInput(QSP_TRUE))
  {
    onError();
  }
}

/* Errors */
EMSCRIPTEN_KEEPALIVE
void getLastError(QSPErrorInfo *lastError)
{
  QSPErrorInfo errorInfo = QSPGetLastErrorData();

  lastError->ErrorNum = errorInfo.ErrorNum;
  lastError->ErrorDesc = errorInfo.ErrorDesc;
  lastError->ActIndex = errorInfo.ActIndex;
  lastError->TopLineNum = errorInfo.TopLineNum;
  lastError->IntLineNum = errorInfo.IntLineNum;
  lastError->LocName = errorInfo.LocName;
  lastError->IntLine = errorInfo.IntLine;
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL getVarValue(QSP_CHAR *name, QSPVariant *res)
{
  return QSPGetVarValue(QSPStringFromC(name), 0, res);
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL getVarValueByIndex(QSP_CHAR *name, int index, QSPVariant *res)
{
  return QSPGetVarValue(QSPStringFromC(name), index, res);
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL getVarValueByKey(QSP_CHAR *name, QSP_CHAR *key, QSPVariant *res)
{
  int index = 0;
  QSPString qspName = QSPStringFromC(name);
  QSPGetVarIndexByString(qspName, QSPStringFromC(key), &index);
  return QSPGetVarValue(qspName, index, res);
}

EMSCRIPTEN_KEEPALIVE
int getVarSize(QSP_CHAR *name)
{
  int res = 0;
  QSPGetVarValuesCount(QSPStringFromC(name), &res);
  return res;
}

/* callbacks */
EMSCRIPTEN_KEEPALIVE
void setCallback(int type, QSP_CALLBACK func)
{
  QSPSetCallback(type, func);
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
void getCurStateData(QSPString *loc, int *actIndex, int *lineNum)
{
  QSPGetCurStateData(loc, actIndex, lineNum);
}

// TODO update when new api is ready
// EMSCRIPTEN_KEEPALIVE
// QSPString *getLocationsList(int *count)
// {
//   *count = qspLocsCount;
//   QSPString *lines = (QSPString *)malloc(qspLocsCount * sizeof(QSPString));
//   int i;
//   for (i = 0; i < qspLocsCount; ++i)
//   {
//     lines[i] = qspLocs[i].Name;
//   }
//   return lines;
// }

// EMSCRIPTEN_KEEPALIVE
// QSPString *getLocationCode(QSP_CHAR *name, int *count)
// {
//   int locInd = qspLocIndex(QSPStringFromC(name));
//   if (locInd >= 0)
//   {
//     QSPLocation *loc = qspLocs + locInd;

//     *count = loc->OnVisitLinesCount;
//     QSPString *lines = (QSPString *)malloc(loc->OnVisitLinesCount * sizeof(QSPString));
//     int i;
//     for (i = 0; i < loc->OnVisitLinesCount; ++i)
//     {
//       lines[i] = loc->OnVisitLines[i].Str;
//     }
//     return lines;
//   }
// }

// EMSCRIPTEN_KEEPALIVE
// QSPString *getActionCode(QSP_CHAR *name, int index, int *count)
// {
//   int locInd = qspLocIndex(QSPStringFromC(name));

//   if (locInd >= 0 && index >= 0 && index < QSP_MAXACTIONS)
//   {
//     QSPLocation *loc = qspLocs + locInd;
//     QSPLocAct *act = loc->Actions + index;
//     *count = act->OnPressLinesCount;
//     QSPString *lines = (QSPString *)malloc(act->OnPressLinesCount * sizeof(QSPString));
//     int i;
//     for (i = 0; i < act->OnPressLinesCount; ++i)
//     {
//       lines[i] = act->OnPressLines[i].Str;
//     }
//     return lines;
//   }
// }

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