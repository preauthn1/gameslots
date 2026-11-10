<?php

namespace app\common\pixel\channel;

use Exception;
use app\common\pixel\Channel;
use FacebookAds\Api;
use FacebookAds\Logger\CurlLogger;
use FacebookAds\Object\ServerSide\ActionSource;
use FacebookAds\Object\ServerSide\CustomData;
use FacebookAds\Object\ServerSide\Event;
use FacebookAds\Object\ServerSide\EventRequest;
use FacebookAds\Object\ServerSide\EventResponse;
use FacebookAds\Object\ServerSide\UserData;
use think\facade\Log;
class Facebook extends Channel {

    // 事件名称映射数组
    protected $events = [
        'reg' => 'CompleteRegistration',
        'first_recharge' => 'Purchase',
        'page' => 'PageView',
    ];
    public function init($config) {
        if (!isset($config['token']) || !isset($config['code'])) {
            throw new Exception('token和code不能为空');
        }
        $this->token = $config['token'];
        $this->code = $config['code'];
        $this->config = $config;
    }

    public function send(string $eventName, array $customData, string $eventId, array $userData = null) {
        if (!class_exists(Api::class)) {
            return false;
        }
        $api = Api::init(null, null, $this->token);
        $api->setLogger(new CurlLogger());

        $event = (new Event())
            ->setEventName($this->getEventName($eventName))
            ->setEventTime(time())
            ->setEventId($eventId)
            ->setUserData(new UserData($userData))
            ->setCustomData(new CustomData($customData))
            ->setActionSource(ActionSource::WEBSITE);

        $request = (new EventRequest($this->code))->setEvents([$event]);

        if (isset($this->config['test_event_code']) && $this->config['test_event_code']) {
            $request->setTestEventCode($this->config['test_event_code']);
        }
        try {
            return $request->execute();
        } catch (Exception $e) {
            Log::error($e);
        }

        return null;
    }
}