package org.eclipse.dirigible.commons.api.context;

import java.util.HashMap;
import java.util.Map;

import org.eclipse.dirigible.commons.api.scripting.ScriptingContextException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Scripting context facade is the centralized place where the different scripting facade providers
 * can register the request (sync) scoped objects
 *
 */
public class ThreadContextFacade {
	
	private static final Logger logger = LoggerFactory.getLogger(ThreadContextFacade.class);
	
    private static final ThreadLocal<Map<String, Object>> CONTEXT = new ThreadLocal<Map<String, Object>>();

    /**
     * Initializes the context. This has to be called at the very first (as possible) place at the service entry point
     * @throws ScriptingContextException in case of an error
     */
    public static final void setUp() throws ScriptingContextException {
    	CONTEXT.set(new HashMap<String, Object>());
    	logger.debug("Scripting context {} has been set up", Thread.currentThread().hashCode());
    }
    
    /**
     * IMPORTANT! This have to be added at the finally block to clean up objects after the execution of the service
     * @throws ScriptingContextException in case of an error
     */
    public static final void tearDown() throws ScriptingContextException {
    	CONTEXT.set(null);
    	logger.debug("Scripting context {} has been torn up", Thread.currentThread().hashCode());
    }
    
    /**
     * Get an context scripting object
     * 
     * @param key the key
     * @return the value by this key
     * @throws ScriptingContextException in case of an error
     */
    public static final Object get(String key) throws ScriptingContextException {
    	checkContext();
    	return CONTEXT.get().get(key);
    }

    /**
     * Set an context scripting object
     * 
     * @param key the key
     * @param value the value
     * @throws ScriptingContextException in case of an error
     */
    public static final void set(String key, Object value) throws ScriptingContextException {
    	checkContext();
    	CONTEXT.get().put(key, value);
    	logger.debug("Context object has been added to {} with key {}", Thread.currentThread().hashCode(), key);
    }
    
    private static void checkContext() throws ScriptingContextException {
		if (CONTEXT.get() == null) {
    		throw new ScriptingContextException("Context has not been initialized");
    	}
	}
    
    /**
     * Check whether the facade is valid
     * @return yes, if it is valid
     */
    public static boolean isValid() {
		return (CONTEXT.get() != null);
	}
 
}
